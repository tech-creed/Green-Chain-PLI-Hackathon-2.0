// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KYC {
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected
    }

    uint256 public certificateCount = 0;

    struct Certificate {
        string ipfsUrl;
        VerificationStatus status;
        address submittedBy;
        address verifiedBy;
    }

    mapping(address => Certificate) public certificates;
    address[] public industries;

    event CertificateSubmitted(address indexed industry, string ipfsUrl);

    event CertificateVerified(
        address indexed government,
        address indexed industry,
        VerificationStatus status
    );

    modifier onlyPendingVerification(address industry) {
        require(
            certificates[industry].status == VerificationStatus.Pending,
            "KYC: Certificate not pending verification"
        );
        _;
    }

    function submitCertificate(string memory ipfsUrl) external {
    require(bytes(ipfsUrl).length > 0, "KYC: IPFS URL cannot be empty");
    require(
        certificates[msg.sender].submittedBy == address(0),
        "KYC: Certificate already submitted"
    );

    certificates[msg.sender] = Certificate({
        ipfsUrl: ipfsUrl,
        status: VerificationStatus.Pending,
        submittedBy: msg.sender,
        verifiedBy: address(0)
    });

    certificateCount++;
    industries.push(msg.sender);

    emit CertificateSubmitted(msg.sender, ipfsUrl);
}
    function verifyCertificate(address industry, VerificationStatus status)
        external
        onlyPendingVerification(industry)
    {
        certificates[industry].status = status;
        certificates[industry].verifiedBy = msg.sender;

        emit CertificateVerified(msg.sender, industry, status);
    }
}
