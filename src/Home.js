import React, { useCallback, useState, useEffect } from 'react';
import Web3 from "web3";
import { loadContract } from "./utils/load-contract";

function Home() {
  const [web3Api, setWeb3Api] = useState();
  const [contract, setContract] = useState();
  const [shouldReload, setShouldReload] = useState(false)
  const [hasAccess, setHasAccess] = useState(false);
  const [data, setData] = useState({
    address: "",
    Balance: null,
    networkName: ""
  });
  const isConnected = data.address && contract
  const [contBalance, setContBalance] = useState(null)

  const [purchaseTitle, setPurchaseTitle] = useState('');
  const [isPurchaseTitleValid, setIsPurchaseTitleValid] = useState(true);
  const [purchasePrice, setPurchasePrice] = useState('');

  useEffect(() => {
    const init = async () => {
      // load metamask
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3Api(web3);
        // load contract
        try {
          const contract = await loadContract("ArtGuard", web3);
          // console.log(contract);
          setContract(contract);
        } catch (error) {
          console.error("Error in loading contract:", error);
        }

      } else {
        console.error("No metamask extension detected!");
        alert("Please install metamask extension!!");
      }
    }

    init();
  }, [])

  // 檢查metamask的異動
  useEffect(() => {
    if (web3Api && web3Api.currentProvider) {
      const provider = web3Api.currentProvider;

      provider.on('accountsChanged', _ => window.location.reload());
      provider.on('chainChanged', _ => window.location.reload());

      // 此useEffect被觸發的時候會刪除舊的listener再設置一個新的
      return () => {
        provider.removeListener('accountsChanged', _ => window.location.reload());
        provider.removeListener('chainChanged', _ => window.location.reload());
      };
    }
  }, [web3Api, shouldReload]);


  // load balance of contract
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balance = await web3Api.eth.getBalance(contract.options.address);
        // console.log('contract balance: ', balance);
        setContBalance(web3Api.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.error("Error getting contract balance:", error);
      }
    };

    if (web3Api && contract) {
      // console.log('load contract balance');
      loadBalance();
    }
  }, [web3Api, contract, shouldReload]);

  // const receive = useCallback(() => {
  //   web3Api.eth.sendTransaction({
  //     from: data.address,
  //     to: contract.options.address,
  //     value: web3Api.utils.toWei('0.1', 'ether')
  //   }).then((r) => {
  //     console.log("r: ", r)
  //     setShouldReload(!shouldReload);
  //   })
  //     .catch(err => {
  //       if (err.code === 100) {
  //         console.log("transaction has been rejected!")
  //       } else {
  //         console.log(err)
  //       }
  //     });
  // }, [web3Api, data.address, contract, setShouldReload, shouldReload])

  const catchData = useCallback(async () => {
    try {
      const accounts = await web3Api.eth.requestAccounts();
      const account = accounts[0];
      const balance = await web3Api.eth.getBalance(account);
      const chainId = await web3Api.eth.getChainId();
      // console.log(chainId.toString())
      const networkName = getNetworkName(chainId.toString());
      setData({
        address: account,
        Balance: Web3.utils.fromWei(balance, 'ether'),
        networkName: networkName,
      });
    } catch (error) {
      console.error("Error getting accounts:", error);
    }
  }, [web3Api])

  useEffect(() => {
    web3Api && catchData();
  }, [web3Api, catchData, shouldReload])

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case "1": return "Ethereum Mainnet";
      case "5": return "Goerli Testnet";
      case "11155111": return "Sepolia Testnet";
      case "17000": return "Holesky Testnet";
      case "1337": return "Ganache";
      // Add other networks as needed, for example:
      default: return "Unknown Network";
    }
  }

  const nameToUnit = (Name) => {
    switch (Name) {
      case "Ethereum Mainnet": return "ETH";
      case "Goerli Testnet": return "GoerliETH";
      case "Sepolia Testnet": return "SepoliaETH";
      case "Holesky Testnet": return "ETH";
      case "Ganache": return "ETH";
      default: return "Unkown Unit";
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.address)
      .then(() => {
        alert('address has been copied~');
      })
      .catch(err => {
        alert('Something was wrong!', err);
      });
  };

  const handlePurchaseTitleChange = (event) => {
    setPurchaseTitle(event.target.value);
  };

  // 用於驗證購買標題
  useEffect(() => {
    setIsPurchaseTitleValid(purchaseTitle !== '');
  }, [purchaseTitle]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const _price = await contract.methods.getFilePrice(purchaseTitle).call();
        setPurchasePrice(_price);
        // console.log(_price)
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    const checkAccess = async () => {
      try {
        const ifHasAccess = await contract.methods.hasAccess(purchaseTitle).call({ from: data.address });
        setHasAccess(ifHasAccess);
        // console.log(ifHasAccess)
      } catch (error) {
        console.error('Error checking access', error);
      }
    }
    // 輸入title的時候抓取價格 & 查看有沒有買過
    if (contract && purchaseTitle) {
      checkAccess();
      if (isPurchaseTitleValid) {
        fetchPrice();
      }
    }
  }, [purchaseTitle, isPurchaseTitleValid, contract]);

  const purchaseFile = async () => {
    if (isPurchaseTitleValid && contract && purchaseTitle && data.address) {
      try {
        await contract.methods.purchaseFile(purchaseTitle).send({
          from: data.address,
          value: purchasePrice
        })
          .then(r => {
            console.log(r);
            console.log('Purchase successful');
            setShouldReload(!shouldReload);
          })
      } catch (error) {
        console.error('Error purchasing file:', error);
      }
    }
  };

  return (
    <div className="home">

      <p><strong>Address: </strong>
        <span onClick={handleCopy} style={{ cursor: 'pointer' }}>
          {data.address}</span>
      </p>
      <p><strong>Balance: </strong>
        {data.Balance === null ? null : parseFloat(data.Balance).toFixed(4)
          + " " + nameToUnit(data.networkName)}
      </p>
      <p><strong>Network: </strong>
        {data.networkName}
      </p>
      <p><strong>Contract balance: </strong>
        {parseFloat(contBalance).toFixed(4)} ETH
      </p>
      {!isConnected &&
        <i className='no-contract'>
          Please connect to Network
        </i>
      }
      {/* <div>
        <button
          disabled={!isConnected}
          onClick={receive}
          className="button receive">Donate 0.1 eth
        </button>

      </div > */}
      <div className='purchase-section'>
        <input
          type="text"
          value={purchaseTitle}
          onChange={handlePurchaseTitleChange}
          placeholder='Enter title to purchase'
        />
        {!isPurchaseTitleValid && <p className="error">Please enter a valid title</p>}
        {purchasePrice && (
          <p>Price for "{purchaseTitle}": {web3Api.utils.fromWei(purchasePrice, 'ether')} ETH</p>
        )}
        {hasAccess && <p>You have access to this Art!!</p>}
        <button className='purchase' onClick={purchaseFile} disabled={(!purchasePrice) || hasAccess}>
          Purchase
        </button>

      </div>
    </div >
  );
}

export default Home;
