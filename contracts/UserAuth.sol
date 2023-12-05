// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserAuth {
    uint public userCount;

    struct User {
        string name;
        string privilege;
        string authority;
    }

    event UserRegistered(
        address indexed walletId,
        string indexed name,
        string indexed privilege,
        string authority
    );

    mapping(address => User) public Users;

    function checkUserExists(address _userAddress) public view returns (bool) {
        return
            keccak256(abi.encodePacked(Users[_userAddress].privilege)) ==
            keccak256(abi.encodePacked("government")) ||
            keccak256(abi.encodePacked(Users[_userAddress].privilege)) ==
            keccak256(abi.encodePacked("industry")) ||
            keccak256(abi.encodePacked(Users[_userAddress].privilege)) ==
            keccak256(abi.encodePacked("individual"));
    }

    function setUser(
        address _walletId,
        string memory _name,
        string memory _privilege,
        string memory _authority
    ) public {
        Users[_walletId] = User(_name, _privilege, _authority);
        userCount += 1;
        emit UserRegistered(_walletId, _name, _privilege, _authority);
    }
}
