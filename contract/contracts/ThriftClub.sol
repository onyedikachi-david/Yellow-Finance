// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// Imports token price conversioner library
import "./PriceConverter.sol";
import "./DAOContract.sol";
import "./ChainlinkContract.sol";
import "./IDAOContract.sol";

contract ThriftClub is IERC721Receiver, VRFConsumerBaseV2 {
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

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    // Storage parameters
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    uint64 public s_subscriptionId;
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

    address public token;
    uint256 public cycleDuration;
    uint256 public contributionAmount;
    uint256 public penalty;
    uint256 public maxParticipant;
    string public name;
    string public description;

    address public i_priceFeedToken;

    enum TANDA_STATE {
        OPEN,
        CLOSED,
        IN_PROGRESS,
        COMPLETED
    }

    mapping(address => bool) public isParticipant;
    address[] public participants;

    // Mapping to track users who have paid the penalty fee
    mapping(address => bool) public hasPaidPenalty;

    // NFT contract
    IERC721 public nftContract;

    // DAO contract
    IDAOContract public daoContract;

    // Chainlink contract
    ChainlinkContract public chainlinkContract;

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

        token = _token;
        cycleDuration = _cycleDuration;
        contributionAmount = _contributionAmount;
        penalty = _penalty;
        maxParticipant = _maxParticipant;
        name = _name;
        description = _description;
        nftContract = IERC721(_nftContract);
        daoContract = IDAOContract(_daoContract);
        chainlinkContract = new ChainlinkContract();

        setPriceFeedToken(token);
    }

    // Fee collection
    uint256 public ServiceFeePurse;
    mapping(address => uint256) public ServiceFeePurseTokenBalances;
    uint256 public ThriftPurseBalance;
    mapping(address => uint256) public ThriftPurseTokenBalance;
    uint256 public ThriftPursePenaltyBalance;
    mapping(address => uint256) public ThriftPursePenaltyTokenBalance;

    // function joinThriftClub(
    //     address _tokenAddress,
    //     uint256 _tokenAmount
    // ) public payable {
    //     require(!isParticipant[msg.sender], "Already a participant");
    //     require(isValidToken(_tokenAddress), "Invalid token");
    //     uint256 total = penalty + contributionAmount + MAXIMUM_FEE_USD;
    //     require(
    //         msg.value == total,
    //         "Total must be sum of penalty and contribution amount"
    //     );
    //     if (_tokenAddress == address(0)) {
    //         if (
    //             (msg.value / 200).getConversionRate(i_priceFeedNative) >
    //             MAXIMUM_FEE_USD
    //         ) {
    //             ServiceFeePurse += MAXIMUM_FEE_USD.getMaxRate(
    //                 i_priceFeedNative
    //             );
    //         } else {
    //             ServiceFeePurse += msg.value / 200;
    //         }

    //         nftContract.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             participants.length
    //         ); // Mint an NFT for the participant

    //         participants.push(msg.sender);
    //         isParticipant[msg.sender] = true;

    //         daoContract.addMember(msg.sender);

    //         emit ParticipantJoined(msg.sender);
    //     } else {}
    // }
    // function joinThriftClub(
    //     address _tokenAddress,
    //     uint256 _tokenAmount
    // ) public payable {
    //     require(!isParticipant[msg.sender], "Already a participant");
    //     require(isValidToken(_tokenAddress), "Invalid token");
    //     uint256 total = penalty + contributionAmount + MAXIMUM_FEE_USD;
    //     require(
    //         msg.value == total,
    //         "Total must be sum of penalty and contribution amount"
    //     );
    //     if (_tokenAddress == address(0)) {
    //         // Ether payment
    //         if (
    //             (msg.value / 200).getConversionRate(i_priceFeedNative) >
    //             MAXIMUM_FEE_USD
    //         ) {
    //             ServiceFeePurse += MAXIMUM_FEE_USD.getMaxRate(
    //                 i_priceFeedNative
    //             );
    //         } else {
    //             ServiceFeePurse += msg.value / 200;
    //         }

    //         nftContract.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             participants.length
    //         ); // Mint an NFT for the participant

    //         participants.push(msg.sender);
    //         isParticipant[msg.sender] = true;

    //         daoContract.addMember(msg.sender);

    //         emit ParticipantJoined(msg.sender);
    //     } else if (
    //         _tokenAddress == i_USDCAddress ||
    //         _tokenAddress == i_USDTAddress ||
    //         _tokenAddress == i_DAIAddress ||
    //         _tokenAddress == i_WBTCAddress
    //     ) {
    //         // Token payment
    //         // Calculate and handle the fees for the specific token address

    //         // Example code for USDC token
    //         uint256 tokenFee = MAXIMUM_FEE_USD.getConversionRate(
    //             i_priceFeedUSDC
    //         );
    //         ServiceFeePurseTokenBalances[_tokenAddress] += tokenFee;

    //         // Transfer the tokens from the sender to the contract
    //         IERC20(_tokenAddress).transferFrom(
    //             msg.sender,
    //             address(this),
    //             _tokenAmount
    //         );

    //         nftContract.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             participants.length
    //         ); // Mint an NFT for the participant

    //         participants.push(msg.sender);
    //         isParticipant[msg.sender] = true;

    //         daoContract.addMember(msg.sender);

    //         emit ParticipantJoined(msg.sender);
    //     } else {
    //         revert("Unsupported token");
    //     }
    // }

    // function joinThriftClub(
    //     address _tokenAddress,
    //     uint256 _tokenAmount
    // ) public payable {
    //     require(!isParticipant[msg.sender], "Already a participant");
    //     require(isValidToken(_tokenAddress), "Invalid token");
    //     uint256 total = penalty + contributionAmount + MAXIMUM_FEE_USD;
    //     require(
    //         msg.value == total,
    //         "Total must be sum of penalty and contribution amount"
    //     );
    //     if (_tokenAddress == address(0)) {
    //         // Ether payment
    //         if (
    //             (msg.value / 200).getConversionRate(i_priceFeedNative) >
    //             MAXIMUM_FEE_USD
    //         ) {
    //             uint256 serviceFee = MAXIMUM_FEE_USD.getMaxRate(
    //                 i_priceFeedNative
    //             );
    //             ServiceFeePurse += serviceFee;
    //             ThriftPurseBalance += msg.value - serviceFee;
    //         } else {
    //             uint256 serviceFee = msg.value / 200;
    //             ServiceFeePurse += serviceFee;
    //             ThriftPurseBalance += msg.value - serviceFee;
    //         }

    //         nftContract.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             participants.length
    //         ); // Mint an NFT for the participant

    //         participants.push(msg.sender);
    //         isParticipant[msg.sender] = true;

    //         daoContract.addMember(msg.sender);

    //         emit ParticipantJoined(msg.sender);
    //     } else if (
    //         _tokenAddress == i_USDCAddress ||
    //         _tokenAddress == i_USDTAddress ||
    //         _tokenAddress == i_DAIAddress ||
    //         _tokenAddress == i_WBTCAddress
    //     ) {
    //         // Token payment
    //         // Calculate and handle the fees for the specific token address

    //         // Example code for USDC token
    //         uint256 tokenFee = MAXIMUM_FEE_USD.getConversionRate(
    //             i_priceFeedUSDC
    //         );
    //         ServiceFeePurseTokenBalances[_tokenAddress] += tokenFee;
    //         ThriftPurseTokenBalance[_tokenAddress] += _tokenAmount - tokenFee;

    //         // Transfer the tokens from the sender to the contract
    //         IERC20(_tokenAddress).transferFrom(
    //             msg.sender,
    //             address(this),
    //             _tokenAmount
    //         );

    //         nftContract.safeTransferFrom(
    //             address(this),
    //             msg.sender,
    //             participants.length
    //         ); // Mint an NFT for the participant

    //         participants.push(msg.sender);
    //         isParticipant[msg.sender] = true;

    //         daoContract.addMember(msg.sender);

    //         emit ParticipantJoined(msg.sender);
    //     } else {
    //         revert("Unsupported token");
    //     }
    // }

    function payPenaltyFee(
        address _tokenAddress,
        uint256 _tokenAmount
    ) public payable {
        require(!hasPaidPenalty[msg.sender], "Penalty fee already paid");
        require(isValidToken(_tokenAddress), "Invalid token");
        require(
            _tokenAddress != address(0) || msg.value == penalty,
            "Incorrect penalty fee amount"
        );

        if (_tokenAddress == address(0)) {
            // Ether payment
            require(msg.value == penalty, "Incorrect penalty fee amount");

            // Store the penalty fee in the ThriftPursePenaltyBalance
            ThriftPursePenaltyBalance += penalty;
        } else {
            // Token payment
            require(
                _tokenAmount == penalty,
                "Incorrect token amount for penalty fee"
            );

            // Store the penalty fee in the ThriftPursePenaltyTokenBalance
            ThriftPursePenaltyTokenBalance[_tokenAddress] += penalty;
        }

        hasPaidPenalty[msg.sender] = true;
    }

    function joinThriftClub(
        address _tokenAddress,
        uint256 _tokenAmount
    ) public {
        require(hasPaidPenalty[msg.sender], "Penalty fee not paid");
        require(!isParticipant[msg.sender], "Already a participant");
        require(isValidToken(_tokenAddress), "Invalid token");

        if (_tokenAddress == address(0)) {
            // Ether payment
            require(
                msg.value == contributionAmount + MAXIMUM_FEE_USD,
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
            ThriftPurseBalance += contributionAmount;
        } else {
            // Token payment
            require(msg.value == 0, "Invalid Ether value");
            require(_tokenAmount > 0, "Invalid token amount");
            require(_tokenAddress == token, "Invalid token");

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
            ThriftPurseTokenBalance[_tokenAddress] += contributionAmount;
        }

        // Mint an NFT for the participant
        nftContract.safeTransferFrom(
            address(this),
            msg.sender,
            participants.length
        );

        participants.push(msg.sender);
        isParticipant[msg.sender] = true;

        daoContract.addMember(msg.sender);

        emit ParticipantJoined(msg.sender);
    }

    function startCycle() external {
        require(participants.length > 0, "No participants");
        require(
            participants.length == maxParticipant,
            "Maximum participants not reached"
        );

        address winner = chainlinkContract.determinePotWinner(participants);
        emit CycleStarted(winner);

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
        return (_token == address(token)); // Replace with the address of the allowed tokens
    }

    function setPriceFeedToken(address _token) internal {
        if (token == i_USDCAddress) {
            i_priceFeedToken = address(USDCAddress);
        } else if (token == i_USDTAddress) {
            i_priceFeedToken = address(USDTAddress);
        } else if (token == i_DAIAddress) {
            i_priceFeedToken = address(DAIAddress);
        } else if (token == i_WBTCAddress) {
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

    function requestRandomWords() external onlyOwner {
        // Will revert if subscription is not set and funded.
        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
    }
}
