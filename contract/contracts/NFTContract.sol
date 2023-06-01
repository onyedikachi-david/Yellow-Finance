// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTContract is ERC721 {
    uint256 private tokenIdCounter;
    mapping(address => bool) private isMinted;
    uint256 public maxSupply;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) {
        tokenIdCounter = 0;
        maxSupply = _maxSupply;
    }

    function mint(address _account) public {
        require(!isMinted[_account], "Already minted NFT for the account");
        require(tokenIdCounter < maxSupply, "Maximum supply reached");

        _safeMint(_account, tokenIdCounter);
        tokenIdCounter++;
        isMinted[_account] = true;
    }
}
