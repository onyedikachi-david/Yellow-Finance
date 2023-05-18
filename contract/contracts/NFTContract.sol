// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTContract is ERC721 {
    uint256 private tokenIdCounter;
    mapping(address => bool) private isMinted;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        tokenIdCounter = 0;
    }

    function mint(address _account) external {
        require(!isMinted[_account], "Already minted NFT for the account");

        _safeMint(_account, tokenIdCounter);
        tokenIdCounter++;
        isMinted[_account] = true;
    }
}
