// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract DAOContract {
    mapping(address => bool) public members;
    mapping(address => bool) public canVote;

    function addMember(address _member) external {
        require(!members[_member], "Member already exists");

        members[_member] = true;
        canVote[_member] = true;
    }

    function removeMember(address _member) external {
        require(members[_member], "Member does not exist");

        delete members[_member];
        delete canVote[_member];
    }

    function vote(uint _proposalId, bool _support) external {
        require(canVote[msg.sender], "Not authorized to vote");

        // Vote on a specific proposal
    }
}
