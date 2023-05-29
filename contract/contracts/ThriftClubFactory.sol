// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@chainlink/contracts/src/v0.8/interfaces/automation/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
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
contract ThriftClubFactory is AutomationCompatible, VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface public COORDINATOR;
    LinkTokenInterface public LINKTOKEN;

    // Sepolia coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;

    // Sepolia LINK token contract. For other networks, see
    // https://docs.chain.link/docs/vrf-contracts/#configurations
    address link_token_contract = 0x779877A7B0D9E8603169DdbD7836e478b4624789;

    uint64 public s_subscriptionId;

    address[] public thriftClubs;
    mapping(address => address) public clubToNFT;
    mapping(address => address) public clubtoDAO;

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

    constructor(
        LinkTokenInterface link,
        KeeperRegistrarInterface registrar
    ) VRFConsumerBaseV2(vrfCoordinator) {
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
    ) external {
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

        createNewSubscription(address(newThriftClub));
        newThriftClub.setSubscriptionId(s_subscriptionId);

        RegistrationParams memory params;
        params.name = _name;
        params.encryptedEmail = bytes("");
        params.upkeepContract = address(newThriftClub);
        params.gasLimit = 500000;
        params.adminAddress = address(this); // Factory contract address
        params.checkData = bytes(""); // Optional check data
        params.offchainConfig = bytes(""); // Optional off-chain config
        params.amount = 100000000000000000; // Amount of LINK tokens to transfer

        registerAndPredictID(params);

        // nftContract.mint(address(newThriftClub));
        // nftContract.transferOwnership(address(newThriftClub)); // Transfer ownership to the new ThriftClub contract
        clubToNFT[address(newThriftClub)] = address(nftContract);
        clubtoDAO[address(newThriftClub)] = address(daoContract);

        thriftClubs.push(address(newThriftClub));
        emit ThriftClubCreated(address(newThriftClub), msg.sender);
    }

    function registerAndPredictID(RegistrationParams memory params) public {
        // LINK must be approved for transfer - this can be done every time or once
        // with an infinite approval
        i_link.approve(address(i_registrar), params.amount);
        uint256 upkeepID = i_registrar.registerUpkeep(params);
        if (upkeepID != 0) {
            // DEV - Use the upkeepID however you see fit
        } else {
            revert("auto-approve disabled");
        }
    }

    function getThriftClubs() external view returns (address[] memory) {
        return thriftClubs;
    }

    function getThriftClub(uint256 _id) external view returns (address) {
        require(_id < thriftClubs.length, "Invalid club ID");
        return thriftClubs[_id];
    }

    function getNFT(address _thriftClub) external view returns (address) {
        require(
            clubToNFT[_thriftClub] != address(0),
            "NFT not found for the club"
        );
        return clubToNFT[_thriftClub];
    }

    function getDAO(address _thriftClub) external view returns (address) {
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
    function setLinkTokenAddress(address linkTokenAddress) public onlyOwner {
        require(linkTokenAddress != address(0));
        emit LinkTokenAddressUpdated(address(LINKTOKEN), linkTokenAddress);
        LINKTOKEN = LinkTokenInterface(linkTokenAddress);
    }

    /**
     * @notice Sets the VRF coordinator address.
     */
    function setVRFCoordinatorV2Address(
        address coordinatorAddress
    ) public onlyOwner {
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
    function setKeeperRegistryAddress(
        address keeperRegistryAddress
    ) public onlyOwner {
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
    ) private onlyOwner returns (uint256) {
        s_subscriptionId = COORDINATOR.createSubscription();
        // Add this contract as a consumer of its own subscription.
        COORDINATOR.addConsumer(s_subscriptionId, address(_consumerAddress));
        return s_subscriptionId;
    }

    // Assumes this contract owns link.
    // 1000000000000000000 = 1 LINK
    function topUpSubscription(uint256 amount) external onlyOwner {
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(s_subscriptionId)
        );
    }

    function addConsumer(address consumerAddress) external onlyOwner {
        // Add a consumer contract to the subscription.
        COORDINATOR.addConsumer(s_subscriptionId, consumerAddress);
    }

    function removeConsumer(address consumerAddress) external onlyOwner {
        // Remove a consumer contract from the subscription.
        COORDINATOR.removeConsumer(s_subscriptionId, consumerAddress);
    }

    function cancelSubscription(address receivingWallet) external onlyOwner {
        // Cancel the subscription and send the remaining LINK to a wallet address.
        COORDINATOR.cancelSubscription(s_subscriptionId, receivingWallet);
        s_subscriptionId = 0;
    }

    // Transfer this contract's funds to an address.
    // 1000000000000000000 = 1 LINK
    function withdraw(uint256 amount, address to) external onlyOwner {
        LINKTOKEN.transfer(to, amount);
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
