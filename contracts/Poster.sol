// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Poster {
    event NewPost(address indexed user, string content, string indexed tag);

    function post(string memory content, string memory tag) public {
        require(bytes(content).length > 0, "Empty content");
        emit NewPost(msg.sender, content, tag);
    }
}
