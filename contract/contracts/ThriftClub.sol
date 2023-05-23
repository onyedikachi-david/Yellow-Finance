// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Main contract.

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ThriftClub is IERC721Receiver {
    address public token;
    uint public cycleDuration;
    uint public contributionAmount;
    uint public max_number;

    enum TANDA_STATE {
        OPEN,
        CLOSED,
        IN_PROGRESS,
        COMPLETED,
    }

    mapping(address => bool) public isParticipant;
    address[] public participants;

    // NFT contract
    IERC721 public nftContract;

    // DAO contract
    DAOContract public daoContract;

    // Chainlink contract
    ChainlinkContract public chainlinkContract;

    event ParticipantJoined(address indexed participant);
    event CycleStarted(address indexed winner);

    constructor(address _token, uint _cycleDuration, uint _contributionAmount, uint _max_number) {
        token = _token;
        cycleDuration = _cycleDuration;
        contributionAmount = _contributionAmount;
        max_number = _max_number;

        nftContract = IERC721(msg.sender); // Assuming the NFT contract is deployed by the same deployer as ThriftClub
        daoContract = new DAOContract();
        chainlinkContract = new ChainlinkContract();
    }

    function joinThriftClub() external {
        require(!isParticipant[msg.sender], "Already a participant");
        require(isValidToken(token), "Invalid token");

        nftContract.safeTransferFrom(address(this), msg.sender, participants.length); // Mint an NFT for the participant
        participants.push(msg.sender);
        isParticipant[msg.sender] = true;

        daoContract.addMember(msg.sender);

        emit ParticipantJoined(msg.sender);
    }

    function startCycle() external {
        require(participants.length > 0, "No participants");

        address winner = chainlinkContract.determinePotWinner(participants);
        emit CycleStarted(winner);

        // Distribute the pot to the winner
    }

    function changeMembershipSize(uint _newSize) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the membership size
    }

    function changePenaltyFee(uint _newFee) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the penalty fee for new members
    }

    function changeContributionAmount(uint _newAmount) external {
        require(daoContract.canVote(msg.sender), "Not authorized to vote");

        // Use DAO voting to decide on changing the contribution amount for each cycle
    }

    // Check if the given token is a valid token for contribution
    function isValidToken(address _token) internal pure returns (bool) {
        return (_token == address(0x...)); // Replace with the address of the allowed tokens
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
}
