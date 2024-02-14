App = {
  loading: false,
  contracts: {},
  account: "",

  load: async () => {
    console.log("App connecting...");
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContracts();
    return false;
  },

  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },

  loadAccount: async () => {
    // get current account
    web3.eth
      .getAccounts()
      .then((accounts) => {
        App.account = accounts[0];
        console.log(App.account);
      })
      .catch((error) => {
        console.error(error);
      });
  },

  loadContracts: async () => {
    // users ABI
    const UserContract = await $.getJSON("/contracts/UserAuth.json");
    const contractAddress = "0x73a1637b532c203fD2Cb2f30DaC2A5C920D08E36";
    App.contracts.user = new web3.eth.Contract(
      UserContract.abi,
      contractAddress
    );

    // emission contract ABI
    const emissionContract = await $.getJSON("/contracts/Emission.json");
    const emissionContractAddress =
      "0xB2Bb3Dd210A16b4B13B1Da54DF3A1fe1037C03F0";
    App.contracts.emission = new web3.eth.Contract(
      emissionContract.abi,
      emissionContractAddress
    );

    // token ABI
    const GreenCreditToken = await $.getJSON(
      "/contracts/GreenCreditToken.json"
    );
    const greenCreditTokenAddress =
      "0x2d5703C425E3277cCbfbA4d560c0513a10236A63";
    App.contracts.token = new web3.eth.Contract(
      GreenCreditToken.abi,
      greenCreditTokenAddress
    );

    // KYC ABI
    const KYCContract = await $.getJSON("/contracts/KYC.json");
    const KYCContractAddress = "0xBAAb0677fb462FA43CAD97b9764535b9b9aFAbF1";
    App.contracts.kyc = new web3.eth.Contract(
      KYCContract.abi,
      KYCContractAddress
    );
  },

  connectWalletRegister: async () => {
    await App.load();
    data = {};

    data["name"] = document.getElementById("register_name").value;
    data["role"] = document.getElementById("register_role").value;
    data["authority"] = document.getElementById("register_authority").value;
    data["wallet_id"] = App.account;

    if (data["role"] == "government") {
      await App.contracts.token.methods
        .grantGovernmentPrivilege(App.account)
        .send({ from: App.account });
    } else if (data["role"] == "industry") {
      await App.contracts.token.methods
        .grantIndustryPrivilege(App.account)
        .send({ from: App.account });
    }

    await App.contracts.user.methods
      .setUser(data["wallet_id"], data["name"], data["role"], data["authority"])
      .send({ from: App.account });
    let r = await fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-type": "application/json;charset=UTF-8" },
    });
    r = await r.json();
    if (r) {
      alert(data["name"] + " Welcome to the GreenChain EcoSystem");
      if (data["role"] == "industry") {
        window.location.href = `/ipfs/kyc-file-upload`;
      } else {
        window.location.href = `/dashboard`;
      }
    }
  },

  KYCVerification: async () => {
    await App.load();

    const form = document.getElementById("kycForm");

    const formData = new FormData(form);
    try {
      const response = await fetch("/ipfs/file-upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response:", responseData);

        await App.contracts.kyc.methods
          .submitCertificate(responseData.ipfsUrl_Document)
          .send({ from: App.account });

        alert("Your KYC Submitted Successfully");
        window.location.href = `/dashboard`;
      } else {
        console.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },

  KYCStatus: async () => {
    await App.load();

    const kycInfo = await App.contracts.kyc.methods
      .certificates(App.account)
      .call();

    const getStatusText = (status) => {
      switch (status) {
        case "0":
          return "Pending";
        case "1":
          return "Approved";
        case "2":
          return "Rejected";
        default:
          return "Unknown";
      }
    };

    const kycStatus = getStatusText(kycInfo.status);

    document.getElementById("kycStatus").innerText = `${kycStatus}`;

    const docLinkElement = document.getElementById("docLink");
    docLinkElement.innerHTML = `<a href="${kycInfo.ipfsUrl}" target="_blank">View Document</a>`;
  },

  connectWalletLogin: async () => {
    await App.load();
    data = {};
    data["wallet_id"] = App.account;

    var userOrNot = await App.contracts.user.methods.checkUserExists(
      App.account
    );

    console.log(App.contracts.user.methods.Users(App.account));

    if (userOrNot) {
      var dataChain = await App.contracts.user.methods
        .Users(App.account)
        .call();

      data["name"] = dataChain["name"];
      data["role"] = dataChain["privilege"];
      let r = await fetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      });
      r = await r.json();
      if (r) {
        window.location.href = `/dashboard`;
      }
    } else {
      alert("need to register");
    }
  },

  EmissionMark: async () => {
    await App.load();

    const walletID = document.getElementById("walletID").value;
    const co2 = document.getElementById("co2").value;
    const emissionDate = document
      .getElementById("emissionDate")
      .value.toString();
    const etherValue = web3.utils.toWei(
      (parseFloat(0.001) * parseFloat(co2)).toString(),
      "ether"
    );

    App.contracts.emission.methods
      .createEmissionData(walletID, co2, emissionDate)
      .send({ from: App.account, value: etherValue })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });

    await App.contracts.token.methods
      .burnToken(App.account, 1)
      .send({ from: App.account })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/mark-co2";
      });
  },

  FetchKYCIndustry: async () => {
    await App.load();
    const certificateCount = await App.contracts.kyc.methods
      .certificateCount()
      .call();

    tabel_body = document.getElementById("tabel-body");
    console.log(certificateCount)
    wal = await App.contracts.kyc.methods.industries(0).call()
    console.log(wal);

    html = ''
    for (var j = 0; j <= certificateCount; j++) {
    
      var industryWallet = await App.contracts.kyc.methods.industries(j).call()
      console.log(industryWallet)

      var certificate = await App.contracts.kyc.methods.certificates(industryWallet).call();

      const getStatusText = (status) => {
        switch (status) {
          case "0":
            return "Pending";
          case "1":
            return "Approved";
          case "2":
            return "Rejected";
          default:
            return "Unknown";
        }
      };
  
      
      console.log(certificate);
      const kycStatus = getStatusText(certificate[1]);
      html += `<tr>
          <th scope="row">${j+1}</th>
          <td>${certificate[2]}</td>
          <td>${certificate[3]}</td>
          <td><a href="${certificate[0]}" target="_blank">View Document</a></td>
          <td>${kycStatus}</td>
          <td style="color:green;"><button onclick="App.KYCVerification('${certificate[2]}')" class='btn'>Approve the KYC</button> </td>
          </tr>`;
      j += 1;
    }

    tabel_body.innerHTML = html;
  },

  KYCVerification: async(industryID)=>{
    await App.load();
    console.log(industryID)
    
    function getCookieValue(cookieName) {
        const cookies = document.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split('=');
            if (cookie[0] === cookieName) {
                return cookie[1];
            }
        }
        return null;
    }

    const userRole = getCookieValue('role')

    if(userRole == 'government'){
        await App.contracts.kyc.methods
        .verifyCertificate(industryID,1)
        .send({ from: App.account });

        window.location.href = "/kyc-verification";
    }
  },

  FetchEmission: async () => {
    await App.load();
    const taskCount = await App.contracts.emission.methods.dataCount().call();
    const userWallet = document.cookie.split(";")[0].split("=")[1];

    tabel_body = document.getElementById("tabel-body");
    html = ``;
    cum_emission = 0;
    cum_fees = 0;

    x_data = [];
    y_data = [];

    j = 1;
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.contracts.emission.methods.emmis(i).call();
      if (userWallet == task[0]) {
        cum_emission += parseFloat(task[1]);
        cum_fees += parseFloat(task[3]);

        x_data.push(task[2]);
        y_data.push(task[1]);

        html += `<tr>
          <th scope="row">${j}</th>
          <td>${task[2]}</td>
          <td>${task[0]}</td>
          <td>${task[1]}</td>
          <td>${task[3] / 1000}</td>
          <td>${cum_emission}</td>
          </tr>`;
        j += 1;
      }
    }

    y_new_data_graph = [];

    if (y_data.length > 7) {
      const rawResponse = await fetch("http://127.0.0.1:3000/week", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: y_data.slice(y_data.length - 7, y_data.length),
        }),
      });

      var y_new_data_responce = await rawResponse.json();
      y_new_data_responce = y_new_data_responce["data"]["0"];

      for (let i = 1; i < y_data.length; i++) {
        y_new_data_graph.push(null);
      }
      y_new_data_graph.push(y_data[y_data.length - 1]);

      for (let i = 1; i < y_new_data_responce.length + 1; i++) {
        x_data.push(
          x_data[6].slice(0, 8) +
            (parseInt(x_data[6].slice(8, 10)) + parseInt(i))
        );
        y_new_data_graph.push(y_new_data_responce[i - 1]);
      }
    }

    var ctxL = document.getElementById("lineChart").getContext("2d");
    var myLineChart = new Chart(ctxL, {
      type: "line",
      data: {
        labels: x_data,
        datasets: [
          {
            lineTension: 0.25,
            label: "Industry Carbon Visualization",
            data: y_data,
            backgroundColor: ["rgba(225, 0, 0, .2)"],
            borderColor: ["rgba(255, 0, 0, .7)"],
            borderWidth: 2,
          },
          {
            lineTension: 0.25,
            label: "AI Predicted Carbon Visualization",
            data: y_new_data_graph,
            backgroundColor: ["rgba(0, 255, 0, .2)"],
            borderColor: ["rgba(0, 255, 0, .7)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
    tabel_body.innerHTML = html;
  },

  FetchAllEmission: async () => {
    await App.load();

    const taskCount = await App.contracts.emission.methods.dataCount().call();

    tabel_body = document.getElementById("full-tabel-body");
    html = ``;

    for (var i = 1; i <= taskCount; i++) {
      const task = await App.contracts.emission.methods.emmis(i).call();
      html += `<tr>
        <th scope="row">${i}</th>
        <td>${task[2]}</td>
        <td>${task[0]}</td>
        <td>${task[1]}</td>
        <td>${task[3]}</td>
        </tr>`;
    }
    tabel_body.innerHTML = html;
  },

  SpecificFetchEmission: async () => {
    await App.load();

    const taskCount = await App.contracts.emission.methods.dataCount().call();
    const walletID = document.getElementById("walletSearch").value;

    let userWallet;

    if (walletID.toLowerCase().startsWith("xdc")) {
      userWallet = "0x" + walletID.slice(3);
    } else if (walletID.toLowerCase().startsWith("0x")) {
      userWallet = walletID;
    } else {
      alert("Invalid input address");
    }

    tabel_body = document.getElementById("trans-tabel-body");
    html = ``;
    cum_emission = 0;
    cum_fees = 0;
    x_data = [];
    y_data = [];
    j = 1;
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.contracts.emission.methods.emmis(i).call();
      console.log(task);
      if (userWallet == task[0]) {
        cum_emission += parseFloat(task[1]);
        cum_fees += parseFloat(task[3]);
        x_data.push(task[2]);
        y_data.push(task[1]);

        html += `<tr>
          <th scope="row">${j}</th>
          <td>${task[2]}</td>
          <td>${task[0]}</td>
          <td>${task[1]}</td>
          <td>${task[3] / 1000}</td>
          <td>${cum_emission}</td>
          </tr>`;
        j += 1;
      }
    }

    y_new_data_graph = [];

    if (y_data.length > 7) {
      const rawResponse = await fetch("http://127.0.0.1:3000/week", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: y_data.slice(y_data.length - 7, y_data.length),
        }),
      });

      var y_new_data_responce = await rawResponse.json();
      y_new_data_responce = y_new_data_responce["data"]["0"];

      for (let i = 1; i < y_data.length; i++) {
        y_new_data_graph.push(null);
      }
      y_new_data_graph.push(y_data[y_data.length - 1]);

      for (let i = 1; i < y_new_data_responce.length + 1; i++) {
        x_data.push(
          x_data[6].slice(0, 8) +
            (parseInt(x_data[6].slice(8, 10)) + parseInt(i))
        );
        y_new_data_graph.push(y_new_data_responce[i - 1]);
      }
    }

    var ctxL = document.getElementById("lineChart").getContext("2d");
    var myLineChart = new Chart(ctxL, {
      type: "line",
      data: {
        labels: x_data,
        datasets: [
          {
            lineTension: 0.25,
            label: "Industry Carbon Visualization",
            data: y_data,
            backgroundColor: ["rgba(225, 0, 0, .2)"],
            borderColor: ["rgba(255, 0, 0, .7)"],
            borderWidth: 2,
          },
          {
            lineTension: 0.25,
            label: "AI Predicted Carbon Visualization",
            data: y_new_data_graph,
            backgroundColor: ["rgba(0, 255, 0, .2)"],
            borderColor: ["rgba(0, 255, 0, .7)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });

    tabel_body.innerHTML = html;
  },

  tokenDetails: async () => {
    await App.load();
    function getCookieValue(cookieName) {
        const cookies = document.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split('=');
            if (cookie[0] === cookieName) {
                return cookie[1];
            }
        }
        return null;
    }

    const availableToken = await App.contracts.token.methods
      .balanceOf(App.account)
      .call();

      const userRole = getCookieValue('role');
      if(userRole == 'individual'){
        document.querySelector("#tokenAvailable").innerHTML =
        parseInt(localStorage.getItem('userTokens')) + " GCT";
      document.querySelector("#tokenName").innerHTML =
        await App.contracts.token.methods.name().call();
      document.querySelector("#tokenSymbol").innerHTML =
        await App.contracts.token.methods.symbol().call();
      }else{
        document.querySelector("#tokenAvailable").innerHTML =
        web3.utils.fromWei(availableToken.toString(), "ether") + " GCT";
      document.querySelector("#tokenName").innerHTML =
        await App.contracts.token.methods.name().call();
      document.querySelector("#tokenSymbol").innerHTML =
        await App.contracts.token.methods.symbol().call();
      }
    
    const tokenPrice = await App.contracts.token.methods.tokenPrice().call();
    const tokenAllowance = await App.contracts.token.methods
      .IndustryAllowance(App.account)
      .call();
    document.querySelector("#tokenAllowance").innerHTML =
      tokenAllowance.toString() + " Tokens";
    document.querySelector("#tokenPrice").innerHTML =
      tokenPrice.toString() + " Wei";
    const totalSupply = await App.contracts.token.methods.totalSupply().call();
    document.querySelector("#tokenSupply").innerHTML =
      totalSupply.toString() + " Wei";
  },

  initAllowance: async () => {
    await App.load();
    const walletID = document.querySelector("#industryWalletID").value;

    if (walletID.toLowerCase().startsWith("xdc")) {
      industryWalletID = "0x" + walletID.slice(3);
    } else if (walletID.toLowerCase().startsWith("0x")) {
      industryWalletID = walletID;
    } else {
      alert("Invalid input address");
    }

    const initTokens = document.querySelector("#initTokens").value;
    const maxAllowance = document.querySelector("#maxAllowance").value;
    await App.contracts.token.methods
      .initialAllowance(industryWalletID, maxAllowance, initTokens)
      .send({ from: App.account })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/dashboard";
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  },

  setTokenPrice: async () => {
    await App.load();
    const newPrice = document.querySelector("#newPrice").value;
    await App.contracts.token.methods
      .setTokenPrice(newPrice)
      .send({ from: App.account })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/dashboard";
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  },

  getReward:async () => {
    await App.load();
    
  },


  detailsToBuy: async () => {
    await App.load();

    const tokenPrice = await App.contracts.token.methods.tokenPrice().call();
    const tokenAllowance = await App.contracts.token.methods
      .IndustryAllowance(App.account)
      .call();
    document.querySelector("#tokenAllowance").innerHTML =
      tokenAllowance.toString() + " Tokens";
    document.querySelector("#tokenPrice").innerHTML =
      tokenPrice.toString() + " Wei";
  },

  buyToken: async () => {
    await App.load();

    const tokenPrice = await App.contracts.token.methods.tokenPrice().call();
    const _to = document.querySelector("#walletID").value;
    const _tokenCount = document.querySelector("#tokenCountForBuy").value;
    const walletID = document.querySelector("#governmentId").value;

    if (walletID.toLowerCase().startsWith("xdc")) {
      _governmentAddress = "0x" + walletID.slice(3);
    } else if (walletID.toLowerCase().startsWith("0x")) {
      _governmentAddress = walletID;
    } else {
      alert("Invalid input address");
    }

    await App.contracts.token.methods
      .buyToken(_to, _tokenCount, _governmentAddress)
      .send({ from: App.account, value: tokenPrice.toString() * _tokenCount })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/dashboard";
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  },

  detailsToListTokenForSell: async () => {
    await App.load();

    const tokenPrice = await App.contracts.token.methods.tokenPrice().call();
    const tokenBalance = await App.contracts.token.methods
      .balanceOf(App.account)
      .call();
    document.querySelector("#tokenBalance").innerHTML =
      web3.utils.fromWei(tokenBalance.toString(), "ether") + " GCT";
    document.querySelector("#tokenPrice").innerHTML =
      tokenPrice.toString() + " Wei";
  },

  listTokenForSell: async () => {
    await App.load();

    const tokenCount = document.querySelector("#tokenCount").value;
    const tokenPriceToSell = document.querySelector("#tokenPriceToSell").value;
    await App.contracts.token.methods
      .listTokensForSale(tokenCount, tokenPriceToSell)
      .send({ from: App.account })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/dashboard";
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  },

  fetchListedTokensForSell: async () => {
    await App.load();
    var cardBody = document.querySelector(".cardBody");
    html = ``;
    const listingCount = await App.contracts.token.methods
      .listingCount()
      .call();
    for (var i = 0; i < listingCount; i++) {
      var listData = await App.contracts.token.methods.listings(i).call();

      html += `<div class="col-lg-3 mt-4 mt-lg-0" data-aos="fade-up" data-aos-delay="200" ${
        !listData[3] ? 'style="display: none;"' : ""
      }>
            <div class="box">
              <img src="img/logo.png" class="img-fluid" alt="">
              <p style="font-size: 12px;">${listData[0]}</p>
              <p>Token Price: ${listData[2]}</p>
              <input type="hidden" id="listingId" value="${i}">
              <input type="hidden" id="tokenPriceForBuy" value="${listData[2]}">
              <button class="buy" onClick="App.buyListedToken();">Buy ${
                listData[1]
              } ECR</button>
            </div>
          </div>`;

      cardBody.innerHTML = html;
    }
  },

  buyListedToken: async () => {
    await App.load();

    const listingId = document.querySelector("#listingId").value;
    const tokenPrice = document.querySelector("#tokenPriceForBuy").value;
    await App.contracts.token.methods
      .buyTokensFromMarketpalce(listingId)
      .send({ from: App.account, value: tokenPrice })

      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
        window.location.href = "/dashboard";
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  },
};
