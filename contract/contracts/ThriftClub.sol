// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
// Imports token price conversioner library
import "./PriceConverter.sol";
import "./DAOContract.sol";
// import "./ChainlinkContract.sol";
import "./IDAOContract.sol";

contract ThriftClub is IERC721Receiver, VRFConsumerBaseV2 {
    enum TANDA_STATE {
        OPEN,
        CLOSED,
        PAYMENT_IN_PROGRESS,
        COMPLETED
    }
    struct ThriftClubData {
        address token;
        uint256 cycleDuration;
        uint256 contributionAmount;
        uint256 penalty;
        uint256 maxParticipant;
        string name;
        string description;
        IERC721 nftContract;
        IDAOContract daoContract;
        TANDA_STATE t_state;
        uint256 lastUpdateTimestamp;
    }

    ThriftClubData s_thriftClub;

    uint256 paidParticipants = 0;

    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    // CHANGE THIS TO POLYGON MUMBAI
    // Sepolia coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;

    // Sepolia LINK token contract. For other networks, see
    // https://docs.chain.link/docs/vrf-contracts/#configurations
    address link_token_contract = 0x779877A7B0D9E8603169DdbD7836e478b4624789;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    // A reasonable default is 100000, but this value could be different
    // on other networks.
    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;

    // Storage parameters
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    uint64 private s_subscriptionId;
    address s_owner;
    // ./PriceConverter gets token price conversions for detrmining max transaction fee
    using PriceConverter for uint256;
    // Chainlink PriceFeeds - (token / USD)
    AggregatorV3Interface private immutable i_priceFeedNative;
    AggregatorV3Interface private immutable i_priceFeedUSDC;
    AggregatorV3Interface private immutable i_priceFeedUSDT;
    AggregatorV3Interface private immutable i_priceFeedDAI;
    AggregatorV3Interface private immutable i_priceFeedBTC;
    // Token Addresses
    address private immutable i_USDCAddress;
    address private immutable i_USDTAddress;
    address private immutable i_DAIAddress;
    address private immutable i_WBTCAddress;
    // constants
    uint256 public constant MAXIMUM_FEE_USD = 50 * 1e18;

    // address public token;
    // uint256 public cycleDuration;
    // uint256 public contributionAmount;
    // uint256 public penalty;
    // uint256 public maxParticipant;
    // string public name;
    // string public description;

    address public i_priceFeedToken;

    mapping(address => bool) public isParticipant;
    address[] public participants;

    // Mapping to track users who have paid the penalty fee
    mapping(address => bool) public hasPaidPenalty;

    // NFT contract
    IERC721 public nftContract;

    // DAO contract
    IDAOContract public daoContract;

    // Chainlink contract
    // ChainlinkContract public chainlinkContract;

    event ParticipantJoined(address indexed participant);
    event CycleStarted(address indexed winner);

    constructor(
        address _token,
        uint256 _cycleDuration,
        uint256 _contributionAmount,
        uint256 _penalty,
        uint256 _maxParticipant,
        string memory _name,
        string memory _description,
        address _nftContract,
        address _daoContract
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(link_token_contract);
        // Hard code these for now
        i_priceFeedNative = AggregatorV3Interface(AggregatorNative);
        i_priceFeedUSDC = AggregatorV3Interface(AggregatorUSDC);
        i_priceFeedUSDT = AggregatorV3Interface(AggregatorUSDT);
        i_priceFeedDAI = AggregatorV3Interface(AggregatorDAI);
        i_priceFeedBTC = AggregatorV3Interface(AggregatordBTC);

        i_USDCAddress = address(USDCAddress);
        i_USDTAddress = address(USDTAddress);
        i_DAIAddress = address(DAIAddress);
        i_WBTCAddress = address(WBTCAddress);

        s_thriftClub.token = _token;
        s_thriftClub.cycleDuration = _cycleDuration;
        s_thriftClub.contributionAmount = _contributionAmount;
        s_thriftClub.penalty = _penalty;
        s_thriftClub.maxParticipant = _maxParticipant;
        s_thriftClub.name = _name;
        s_thriftClub.description = _description;
        s_thriftClub.nftContract = IERC721(_nftContract);
        s_thriftClub.daoContract = IDAOContract(_daoContract);
        s_thriftClub.t_state = TANDA_STATE.OPEN;
        s_thriftClub.lastUpdateTimestamp = block.timestamp;
        // chainlinkContract = new ChainlinkContract();

        setPriceFeedToken(_token);
    }

    // Fee collection
    uint256 public ServiceFeePurse;
    mapping(address => uint256) public ServiceFeePurseTokenBalances;
    uint256 public ThriftPurseBalance;
    mapping(address => uint256) public ThriftPurseTokenBalance;
    uint256 public ThriftPursePenaltyBalance;
    mapping(address => uint256) public ThriftPursePenaltyTokenBalance;

    function payPenaltyFee(
        address _tokenAddress,
        uint256 _tokenAmount
    ) public payable {
        ThriftClubData memory s_thriftClubData;
        require(!hasPaidPenalty[msg.sender], "Penalty fee already paid");
        require(isValidToken(_tokenAddress), "Invalid token");
        require(
            _tokenAddress != address(0) ||
                msg.value == s_thriftClubData.penalty,
            "Incorrect penalty fee amount"
        );

        if (_tokenAddress == address(0)) {
            // Ether payment
            require(
                msg.value == s_thriftClubData.penalty,
                "Incorrect penalty fee amount"
            );

            // Store the penalty fee in the ThriftPursePenaltyBalance
            ThriftPursePenaltyBalance += s_thriftClubData.penalty;

            // Transfer the penalty fee to the contract
            payable(address(this)).transfer(msg.value);
        } else {
            // Token payment
            require(
                _tokenAmount == s_thriftClubData.penalty,
                "Incorrect token amount for penalty fee"
            );

            // Store the penalty fee in the ThriftPursePenaltyTokenBalance
            ThriftPursePenaltyTokenBalance[_tokenAddress] += s_thriftClubData
                .penalty;

            // Transfer the penalty fee to the contract
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenAmount
            );
        }

        hasPaidPenalty[msg.sender] = true;
    }

    function joinThriftClub(
        address _tokenAddress,
        uint256 _tokenAmount
    ) public {
        ThriftClubData memory s_thriftClubData;

        require(hasPaidPenalty[msg.sender], "Penalty fee not paid");
        require(!isParticipant[msg.sender], "Already a participant");
        require(isValidToken(_tokenAddress), "Invalid token");

        if (_tokenAddress == address(0)) {
            // Ether payment
            require(
                msg.value ==
                    ThriftClubData.contributionAmount + MAXIMUM_FEE_USD,
                "Incorrect amount"
            );

            // Calculate and handle fee calculations for Ether payment
            uint256 serviceFee;
            if (msg.value / 200 > MAXIMUM_FEE_USD) {
                serviceFee = MAXIMUM_FEE_USD.getConversionRate(
                    i_priceFeedNative
                );
            } else {
                serviceFee = msg.value / 200;
            }
            ServiceFeePurse += serviceFee;
            ThriftPurseBalance += ThriftClubData.contributionAmount;
            payable(address(this)).transfer(msg.value);
        } else {
            // Token payment
            require(msg.value == 0, "Invalid Ether value");
            require(_tokenAmount > 0, "Invalid token amount");
            require(_tokenAddress == ThriftClubData.token, "Invalid token");

            // Calculate and handle fee calculations for token payment
            uint256 serviceFee;
            if (_tokenAmount / 200 > MAXIMUM_FEE_USD) {
                serviceFee = MAXIMUM_FEE_USD.getConversionRate(
                    i_priceFeedToken
                );
            } else {
                serviceFee = _tokenAmount / 200;
            }
            ServiceFeePurseTokenBalances[_tokenAddress] += serviceFee;
            ThriftPurseTokenBalance[_tokenAddress] += ThriftClubData
                .contributionAmount;
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenAmount
            );
        }

        // Mint an NFT for the participant
        // nftContract.safeTransferFrom(
        //     address(this),
        //     msg.sender,
        //     participants.length
        // );
        nftContract.mint(msg.sender);

        participants.push(msg.sender);
        isParticipant[msg.sender] = true;

        daoContract.addMember(msg.sender);

        emit ParticipantJoined(msg.sender);
        // Change state when the maxParticipant is reached
        if (s_thriftClubData.maxParticipant == participants.length) {
            s_thriftClubData.t_state == TANDA_STATE.PAYMENT_IN_PROGRESS;
        }
    }

    // Have a new cycle started function

    function startCycle() external {
        require(participants.length > 0, "No participants");
        require(
            // participants.length == maxParticipant,
            "Maximum participants not reached"
        );

        // address winner = chainlinkContract.determinePotWinner(participants);
        // emit CycleStarted(winner);

        // Distribute the pot to the winner
    }

    function changeMembershipSize(uint256 _newSize) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the membership size
    }

    function changePenaltyFee(uint256 _newFee) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the penalty fee for new members
    }

    function changeContributionAmount(uint256 _newAmount) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the contribution amount for each cycle
    }

    // Check if the given token is a valid token for contribution
    function isValidToken(address _token) internal pure returns (bool) {
        return (_token == address(ThriftClubData.token)); // Replace with the address of the allowed tokens
    }

    function setPriceFeedToken(address _token) internal {
        if (_token == i_USDCAddress) {
            i_priceFeedToken = address(USDCAddress);
        } else if (_token == i_USDTAddress) {
            i_priceFeedToken = address(USDTAddress);
        } else if (_token == i_DAIAddress) {
            i_priceFeedToken = address(DAIAddress);
        } else if (_token == i_WBTCAddress) {
            i_priceFeedToken = address(WBTCAddress);
        } else {
            // Handle the case where the token address is not valid
            revert("Invalid token address");
        }
    }

    // IERC721Receiver implementation
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function requestRandomWords() internal {
        // Will revert if subscription is not set and funded.
        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function checkUpkeep(
        bytes calldata checkData
    ) external override returns (bool upkeepNeeded, bytes memory performData) {
        // ThriftClubData s_thriftClubData
        TANDA_STATE currState = s_thriftClub.t_state;
        uint256 lastUpdateTimestamp = s_thriftClub.lastUpdateTimestamp;
        uint256 cycleDuration = s_thriftClub.cycleDuration;

        if (
            currState == TANDA_STATE.PAYMENT_IN_PROGRESS &&
            block.timestamp > lastUpdateTimestamp.add(cycleDuration)
        ) {
            upkeepNeeded = true;
        } else {
            upkeepNeeded = false;
        }

        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external override {
        TANDA_STATE currState = s_thriftClub.t_state;
        uint256 lastUpdateTimestamp = s_thriftClub.lastUpdateTimestamp;
        uint256 cycleDuration = s_thriftClub.cycleDuration;

        if (
            currState == TANDA_STATE.PAYMENT_IN_PROGRESS &&
            block.timestamp > lastUpdateTimestamp.add(cycleDuration)
        ) {
            // Perform the necessary actions for when the payment period is over
            // For example, distribute rewards or proceed to the next cycle
            requestRandomWords();
        }

        // Perform any other necessary upkeep tasks

        performData;
    }

    // function fulfillRandomWords(
    //     uint256 /* requestId */,
    //     uint256[] memory randomWords
    // ) internal override {
    //     s_randomWords = randomWords;
    //     // do other stuff, like call winner function to send to pot to the winner
    //     // The winner function change the timestamp and the tanda enum state.
    // }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
        // do other stuff, like call winner function to send to pot to the winner
        uint256 winnerIndex = s_randomWords[0] % participants.length;
        address winner = participants[winnerIndex];

        // Check ThriftPurseBalance and ThriftPurseTokenBalance before transferring the pot balance
        require(
            ThriftPurseBalance > 0 || ThriftPurseTokenBalance[token] > 0,
            "No balance in the ThriftPurse"
        );

        if (ThriftPurseBalance > 0) {
            payable(winner).transfer(ThriftPurseBalance);
            ThriftPurseBalance = 0;
        } else if (ThriftPurseTokenBalance[token] > 0) {
            // Transfer tokens using the appropriate token contract
            require(
                tokenContract.transfer(winner, ThriftPurseTokenBalance[token]),
                "Token transfer failed"
            );
            ThriftPurseTokenBalance[token] = 0;
        }

        // Increment paidParticipants count
        paidParticipants++;

        // Update the state based on the number of paid participants
        if (paidParticipants == maxParticipant) {
            tandaState = TANDA_STATE.CLOSED;
        } else {
            tandaState = TANDA_STATE.OPEN;
        }
    }

    function getThriftClubDetails() public view returns (ThriftClub memory) {
        return s_thriftClub;
    }

    function setSubscriptionId(uint256 subscriptionId) internal {
        s_subscriptionId = subscriptionId;
    }

    function getSubscriptionId() public view returns (uint256) {
        return s_subscriptionId;
    }
}
