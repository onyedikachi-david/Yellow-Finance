// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ThriftClub.sol";
import "./NFTContract.sol";
import "./DAOContract.sol";

// Factory contract
contract ThriftClubFactory {
    address[] public thriftClubs;
    mapping(address => address) public clubToNFT;
    mapping(address => address) public clubtoDAO;

    event ThriftClubCreated(
        address indexed thriftClub,
        address indexed creator
    );

    function createThriftClub(
        address _token,
        uint256 _cycleDuration,
        uint256 _contributionAmount,
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
            _maxParticipant,
            _name,
            _description,
            address(nftContract),
            address(daoContract)
        );

        nftContract.mint(address(newThriftClub));
        clubToNFT[address(newThriftClub)] = address(nftContract);

        thriftClubs.push(address(newThriftClub));
        emit ThriftClubCreated(address(newThriftClub), msg.sender);
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
}
