// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ticket is ERC721Enumerable, Ownable {
    uint256 private _tokenId;

    struct TicketData {
        string title;
        string venue;
        uint256 date;
        uint256 price;
        string imageURI;
    }

    mapping(uint256 => TicketData) public tickets;

    constructor() ERC721("TicketToken", "TICK") {}

    function mintTicket(
        string memory title,
        string memory venue,
        uint256 date,
        uint256 price,
        string memory imageURI
    ) public onlyOwner {
        _tokenId++;
        tickets[_tokenId] = TicketData(title, venue, date, price, imageURI);
        _mint(msg.sender, _tokenId);
    }

    function buyTicket(uint256 tokenId) public payable {
        require(msg.value == tickets[tokenId].price, "Incorrect payment amount");
        address owner = ownerOf(tokenId);
        payable(owner).transfer(msg.value);
        _transfer(owner, msg.sender, tokenId);
    }
}
