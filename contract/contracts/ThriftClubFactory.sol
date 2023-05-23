// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Factory contract

contract ThriftClubFactory {
    address[] public thriftClubs;

    event ThriftClubCreated(
        address indexed thriftClub,
        address indexed creator
    );

    function createThriftClub(
        address _token,
        uint _cycleDuration,
        uint _contributionAmount
    ) external {
        ThriftClub newThriftClub = new ThriftClub(
            _token,
            _cycleDuration,
            _contributionAmount
        );
        thriftClubs.push(address(newThriftClub));
        emit ThriftClubCreated(address(newThriftClub), msg.sender);
    }

    function getThriftClubs() external view returns (address[] memory) {
        return thriftClubs;
    }
}
