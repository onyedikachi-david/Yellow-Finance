// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IDAOContract {
    function addMember(address _member) external;
    function removeMember(address _member) external;
    function vote(uint _proposalId, bool _support) external;
    // Others
