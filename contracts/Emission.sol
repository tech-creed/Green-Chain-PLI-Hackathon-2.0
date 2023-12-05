// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Emission {
    uint256 public dataCount = 0;
    
    struct Data {
        address wallet_id;
        string carbon;
        string date;
        uint fees;
    }

    event EmissionData(address indexed wallet_id, string indexed carbon, string indexed date, uint fees);

    mapping(uint256 => Data) public emmis;

    function createEmissionData(address _walletID, string memory _carbon, string memory _date) public payable {
        require(msg.value > 0, "Fees should be greater than 0");

        dataCount++;
        emmis[dataCount] = Data(_walletID, _carbon, _date, msg.value);
        emit EmissionData(_walletID, _carbon, _date, msg.value);
    }

    function collectFee(address payable _govId) public {
        require(msg.sender == _govId, "Only authorized entity can collect fees");
        
        _govId.transfer(address(this).balance);
    }

}