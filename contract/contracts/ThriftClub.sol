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
import "./NFTContract.sol";
import "./IDAOContract.sol";

error __TransferFailed();

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

    ThriftClubData public s_thriftClub;

    uint256 paidParticipants = 0;

    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    // CHANGE THIS TO POLYGON MUMBAI
    // Sepolia coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

    // Sepolia LINK token contract. For other networks, see
    // https://docs.chain.link/docs/vrf-contracts/#configurations
    address link_token_contract = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;

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
    address private immutable i_NativeAddress;
    address private immutable i_USDCAddress;
    address private immutable i_USDTAddress;
    address private immutable i_DAIAddress;
    address private immutable i_WBTCAddress;
    // constants
    uint256 public constant MAXIMUM_FEE_USD = 50 * 1e18;

    AggregatorV3Interface priceFeed = AggregatorV3Interface(i_priceFeedToken);

    address public i_priceFeedToken;

    mapping(address => bool) public isParticipant;
    address[] public participants;

    // Mapping to track users who have paid the penalty fee
    mapping(address => bool) public hasPaidPenalty;

    // NFT contract
    // IERC721 public nftContract;

    // DAO contract
    IDAOContract public daoContract;

    // Chainlink contract
    // ChainlinkContract public chainlinkContract;

    event ParticipantJoined(address indexed participant);
    event CycleStarted(address indexed winner);
    event AddressPaid(address recipient, uint256 amount);

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
        i_priceFeedNative = AggregatorV3Interface(
            0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
        );
        i_priceFeedUSDC = AggregatorV3Interface(
            0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0
        );
        i_priceFeedUSDT = AggregatorV3Interface(
            0x92C09849638959196E976289418e5973CC96d645
        );
        i_priceFeedDAI = AggregatorV3Interface(
            0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046
        );
        i_priceFeedBTC = AggregatorV3Interface(
            0x007A22900a3B98143368Bd5906f8E17e9867581b
        );
        // AggregatorV3Interface private immutable i_priceFeedNative;

        i_NativeAddress = address(0x0000000000000000000000000000000000000000);
        i_USDCAddress = address(0x0FA8781a83E46826621b3BC094Ea2A0212e71B23);
        i_USDTAddress = address(0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832);
        i_DAIAddress = address(0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F);
        i_WBTCAddress = address(0x0d787a4a1548f673ed375445535a6c7A1EE56180);

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

        NFTContract nftContract = NFTContract(_nftContract);

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
        // require(
        //     _tokenAddress != address(0) ||
        //         msg.value == s_thriftClubData.penalty,
        //     "Incorrect penalty fee amount"
        // );

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
    ) public payable {
        ThriftClubData memory s_thriftClubData;

        require(hasPaidPenalty[msg.sender], "Penalty fee not paid");
        require(!isParticipant[msg.sender], "Already a participant");
        require(isValidToken(_tokenAddress), "Invalid token");

        if (_tokenAddress == address(0)) {
            // Ether payment
            require(
                msg.value ==
                    s_thriftClubData.contributionAmount + MAXIMUM_FEE_USD,
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
            ThriftPurseBalance += s_thriftClubData.contributionAmount;
            payable(address(this)).transfer(msg.value);
        } else {
            // Token payment
            require(msg.value == 0, "Invalid Ether value");
            require(_tokenAmount > 0, "Invalid token amount");
            require(_tokenAddress == s_thriftClubData.token, "Invalid token");

            // Calculate and handle fee calculations for token payment
            uint256 serviceFee;
            if (_tokenAmount / 200 > MAXIMUM_FEE_USD) {
                serviceFee = MAXIMUM_FEE_USD.getConversionRate(priceFeed);
            } else {
                serviceFee = _tokenAmount / 200;
            }
            ServiceFeePurseTokenBalances[_tokenAddress] += serviceFee;
            ThriftPurseTokenBalance[_tokenAddress] += s_thriftClubData
                .contributionAmount;
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenAmount
            );
        }

        participants.push(msg.sender);
        isParticipant[msg.sender] = true;

        daoContract.addMember(msg.sender);

        emit ParticipantJoined(msg.sender);
        // Change state when the maxParticipant is reached
        if (s_thriftClubData.maxParticipant == participants.length) {
            s_thriftClubData.t_state == TANDA_STATE.PAYMENT_IN_PROGRESS;
        }
    }

    // Check if the given token is a valid token for contribution
    function isValidToken(address _token) internal returns (bool) {
        return (_token == address(s_thriftClub.token)); // Replace with the address of the allowed tokens
    }

    function setPriceFeedToken(address _token) internal {
        if (_token == i_USDCAddress) {
            i_priceFeedToken = i_USDCAddress;
        } else if (_token == i_USDTAddress) {
            i_priceFeedToken = i_USDTAddress;
        } else if (_token == i_DAIAddress) {
            i_priceFeedToken = i_DAIAddress;
        } else if (_token == i_WBTCAddress) {
            i_priceFeedToken = i_WBTCAddress;
        } else if (_token == i_NativeAddress) {
            i_priceFeedToken = i_NativeAddress;
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
    ) external returns (bool upkeepNeeded, bytes memory performData) {
        // ThriftClubData s_thriftClubData
        TANDA_STATE currState = s_thriftClub.t_state;
        uint256 lastUpdateTimestamp = s_thriftClub.lastUpdateTimestamp;
        uint256 cycleDuration = s_thriftClub.cycleDuration;

        if (
            currState == TANDA_STATE.PAYMENT_IN_PROGRESS &&
            block.timestamp > lastUpdateTimestamp + cycleDuration
        ) {
            upkeepNeeded = true;
        } else {
            upkeepNeeded = false;
        }

        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external {
        TANDA_STATE currState = s_thriftClub.t_state;
        uint256 lastUpdateTimestamp = s_thriftClub.lastUpdateTimestamp;
        uint256 cycleDuration = s_thriftClub.cycleDuration;

        if (
            currState == TANDA_STATE.PAYMENT_IN_PROGRESS &&
            block.timestamp > lastUpdateTimestamp + cycleDuration
        ) {
            // Perform the necessary actions for when the payment period is over
            // For example, distribute rewards or proceed to the next cycle
            requestRandomWords();
        }

        // Perform any other necessary upkeep tasks

        performData;
    }

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
            ThriftPurseBalance > 0 ||
                ThriftPurseTokenBalance[s_thriftClub.token] > 0,
            "No balance in the ThriftPurse"
        );

        if (ThriftPurseBalance > 0) {
            // payable(winner).transfer(ThriftPurseBalance);
            (bool success, ) = msg.sender.call{value: ThriftPurseBalance}("");
            if (!success) {
                revert __TransferFailed();
            }
            emit AddressPaid(winner, ThriftPurseBalance);
            ThriftPurseBalance = 0;
        } else if (ThriftPurseTokenBalance[s_thriftClub.token] > 0) {
            // Transfer tokens using the appropriate token contract
            // address payable tokenAddress = s_thriftClub.token;
            address payable tokenAddress = payable(s_thriftClub.token);

            bool success = IERC20(s_thriftClub.token).transfer(
                msg.sender,
                ThriftPurseTokenBalance[s_thriftClub.token]
            );
            if (!success) {
                revert __TransferFailed();
            }
            emit AddressPaid(
                winner,
                ThriftPurseTokenBalance[s_thriftClub.token]
            );
            ThriftPurseTokenBalance[s_thriftClub.token] = 0;
        }

        // Increment paidParticipants count
        paidParticipants++;

        // Update the state based on the number of paid participants
        if (paidParticipants == s_thriftClub.maxParticipant) {
            s_thriftClub.t_state = TANDA_STATE.CLOSED;
        } else {
            s_thriftClub.t_state = TANDA_STATE.OPEN;
        }
    }

    function getThriftClubData() public view returns (ThriftClubData memory) {
        return
            ThriftClubData(
                s_thriftClub.token,
                s_thriftClub.cycleDuration,
                s_thriftClub.contributionAmount,
                s_thriftClub.penalty,
                s_thriftClub.maxParticipant,
                s_thriftClub.name,
                s_thriftClub.description,
                s_thriftClub.nftContract,
                s_thriftClub.daoContract,
                s_thriftClub.t_state,
                s_thriftClub.lastUpdateTimestamp
            );
    }

    function setSubscriptionId(uint64 subscriptionId) internal {
        s_subscriptionId = subscriptionId;
    }

    function getSubscriptionId() public view returns (uint64) {
        return s_subscriptionId;
    }
}
