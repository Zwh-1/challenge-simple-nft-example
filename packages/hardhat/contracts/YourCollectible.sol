// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YourCollectible
 * @author Scaffold-ETH 2
 * @dev ERC721 NFT合约，支持枚举和URI存储功能
 */
contract YourCollectible is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    // 代币ID计数器
    uint256 public tokenIdCounter;

    /**
     * @dev 构造函数
     */
    constructor() ERC721("YourCollectible", "YCB") Ownable(msg.sender) {}

    /**
     * @dev 返回基础URI，用于构建完整的tokenURI
     */
    function _baseURI() internal pure override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/";
    }

    /**
     * @dev 铸造新NFT
     * @param to 接收者地址
     * @param uri 元数据URI
     * @return tokenId 新铸造的代币ID
     */
    function mintItem(address to, string memory uri) public returns (uint256) {
        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // 覆盖OpenZeppelin ERC721、ERC721Enumerable和ERC721URIStorage的函数

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
