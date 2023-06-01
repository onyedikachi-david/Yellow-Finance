// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.4;
pragma solidity ^0.8.9;
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "./ThriftClub.sol";
import "./NFTContract.sol";
import "./DAOContract.sol";

struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    bytes checkData;
    bytes offchainConfig;
    uint96 amount;
}

interface KeeperRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

// Factory contract
contract ThriftClubFactory is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface public COORDINATOR;
    LinkTokenInterface public LINKTOKEN;

    // Storage parameters
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    // uint64 public s_subscriptionId;
    address s_owner;

    // Mumbai coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

    // Mumbai LINK token contract. For other networks, see
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

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    uint64 public s_subscriptionId;

    address[] public thriftClubs;
    mapping(address => uint64) public ThriftContractTos_subscriptionId;
    mapping(address => address) public clubToNFT;
    mapping(address => address) public clubtoDAO;
    mapping(uint256 => address) public s_upkeepIdToThriftContract;

    address public s_keeperRegistryAddress; // the address of the keeper registry

    // address s_owner;
    LinkTokenInterface public immutable i_link;
    KeeperRegistrarInterface public immutable i_registrar;

    event KeeperRegistryAddressUpdated(address oldAddress, address newAddress);
    event VRFCoordinatorV2AddressUpdated(
        address oldAddress,
        address newAddress
    );
    event LinkTokenAddressUpdated(address oldAddress, address newAddress);

    event ThriftClubCreated(
        address indexed thriftClub,
        address indexed creator
    );
    event UpkeepIDCreated(
        address indexed upkeepContract,
        uint256 indexed upkeepID
    );
    event CreatedNewSubscription(
        address indexed thriftContract,
        uint64 s_subscriptionId
    );

    constructor(
        LinkTokenInterface link,
        KeeperRegistrarInterface registrar
    ) VRFConsumerBaseV2(vrfCoordinator) {
        // COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        // LINKTOKEN = LinkTokenInterface(link_token_contract);
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(link_token_contract);
        s_owner = msg.sender;
        i_link = link;
        i_registrar = registrar;
    }

    function createThriftClub(
        address _token,
        uint256 _cycleDuration,
        uint256 _contributionAmount,
        uint256 _penalty,
        uint256 _maxParticipant,
        string memory _name,
        string memory _description
    ) public {
        DAOContract daoContract = new DAOContract();

        NFTContract nftContract = new NFTContract(
            _name,
            substring(_name, 0, 3),
            _maxParticipant
        );
        ThriftClub newThriftClub = new ThriftClub(
            _token,
            _cycleDuration,
            _contributionAmount,
            _penalty,
            _maxParticipant,
            _name,
            _description,
            address(nftContract),
            address(daoContract)
        );

        // createNewSubscription(address(newThriftClub));
        // newThriftClub.setSubscriptionId(s_subscriptionId);

        // RegistrationParams memory params;
        // params.name = _name;
        // params.encryptedEmail = bytes("");
        // params.upkeepContract = address(newThriftClub);
        // params.gasLimit = 500000;
        // params.adminAddress = address(this); // Factory contract address
        // params.checkData = bytes(""); // Optional check data
        // params.offchainConfig = bytes(""); // Optional off-chain config
        // params.amount = 100000000000000000; // Amount of LINK tokens to transfer

        // registerAndPredictID(params);

        clubToNFT[address(newThriftClub)] = address(nftContract);
        clubtoDAO[address(newThriftClub)] = address(daoContract);

        thriftClubs.push(address(newThriftClub));
        emit ThriftClubCreated(address(newThriftClub), msg.sender);
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() public {
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

    function registerAndPredictID(RegistrationParams memory params) public {
        // LINK must be approved for transfer - this can be done every time or once
        // with an infinite approval
        i_link.approve(address(i_registrar), params.amount);
        uint256 upkeepID = i_registrar.registerUpkeep(params);
        if (upkeepID != 0) {
            // DEV - Use the upkeepID however you see fit
            s_upkeepIdToThriftContract[upkeepID] = address(
                params.upkeepContract
            );
            emit UpkeepIDCreated(address(params.upkeepContract), upkeepID);
        } else {
            revert("auto-approve disabled");
        }
    }

    function getThriftClubs() public view returns (address[] memory) {
        return thriftClubs;
    }

    function getThriftClub(uint256 _id) public view returns (address) {
        require(_id < thriftClubs.length, "Invalid club ID");
        return thriftClubs[_id];
    }

    function getNFT(address _thriftClub) public view returns (address) {
        require(
            clubToNFT[_thriftClub] != address(0),
            "NFT not found for the club"
        );
        return clubToNFT[_thriftClub];
    }

    function getDAO(address _thriftClub) public view returns (address) {
        require(
            clubtoDAO[_thriftClub] != address(0),
            "NFT not found for the club"
        );
        return clubtoDAO[_thriftClub];
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(
            startIndex >= 0 && startIndex < strBytes.length,
            "Invalid start index"
        );
        require(
            endIndex >= startIndex && endIndex < strBytes.length,
            "Invalid end index"
        );

        bytes memory result = new bytes(endIndex - startIndex + 1);
        for (uint256 i = startIndex; i <= endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    /**
     * @notice Sets the LINK token address.
     */
    function setLinkTokenAddress(address linkTokenAddress) public {
        require(linkTokenAddress != address(0));
        emit LinkTokenAddressUpdated(address(LINKTOKEN), linkTokenAddress);
        LINKTOKEN = LinkTokenInterface(linkTokenAddress);
    }

    /**
     * @notice Sets the VRF coordinator address.
     */
    function setVRFCoordinatorV2Address(address coordinatorAddress) public {
        require(coordinatorAddress != address(0));
        emit VRFCoordinatorV2AddressUpdated(
            address(COORDINATOR),
            coordinatorAddress
        );
        COORDINATOR = VRFCoordinatorV2Interface(coordinatorAddress);
    }

    /**
     * @notice Sets the keeper registry address.
     */
    function setKeeperRegistryAddress(address keeperRegistryAddress) public {
        require(keeperRegistryAddress != address(0));
        emit KeeperRegistryAddressUpdated(
            s_keeperRegistryAddress,
            keeperRegistryAddress
        );
        s_keeperRegistryAddress = keeperRegistryAddress;
    }

    // Create a new subscription when the contract is initially deployed.
    function createNewSubscription(
        address _consumerAddress
    ) internal returns (uint256) {
        s_subscriptionId = COORDINATOR.createSubscription();
        ThriftContractTos_subscriptionId[
            address(_consumerAddress)
        ] = s_subscriptionId;
        // Add this contract as a consumer of its own subscription.
        COORDINATOR.addConsumer(s_subscriptionId, address(_consumerAddress));
        emit CreatedNewSubscription(_consumerAddress, s_subscriptionId);
        return s_subscriptionId;
    }

    // Assumes this contract owns link.
    // 1000000000000000000 = 1 LINK
    function topUpSubscription(uint256 amount) public {
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(s_subscriptionId)
        );
    }

    function addConsumer(address consumerAddress) public {
        // Add a consumer contract to the subscription.
        COORDINATOR.addConsumer(s_subscriptionId, consumerAddress);
    }

    function removeConsumer(address consumerAddress) public {
        // Remove a consumer contract from the subscription.
        COORDINATOR.removeConsumer(s_subscriptionId, consumerAddress);
    }

    function cancelSubscription(address receivingWallet) public {
        // Cancel the subscription and send the remaining LINK to a wallet address.
        COORDINATOR.cancelSubscription(s_subscriptionId, receivingWallet);
        s_subscriptionId = 0;
    }

    // Transfer this contract's funds to an address.
    // 1000000000000000000 = 1 LINK
    function withdraw(uint256 amount, address to) public {
        LINKTOKEN.transfer(to, amount);
    }
}
