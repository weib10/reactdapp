import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './Navbar.js';
import Home from './Home';
import Upload from './Upload.js';
import MyArt from './MyArt.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ipfs from './ipfs';
import Web3 from "web3";
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState();
  const [contract, setContract] = useState();
  const [shouldReload, setShouldReload] = useState(false)

  const reloadEffect = useCallback(() => {
    setShouldReload(!shouldReload)
  }, [shouldReload])

  const [data, setData] = useState({
    address: "",
    Balance: null,
    networkName: ""
  });
  // const isConnected = data.address && contract
  // const [contBalance, setContBalance] = useState(null)

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
  }, [web3Api, shouldReload, reloadEffect]);
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

  useEffect(() => {
    web3Api && catchData();
  }, [web3Api, shouldReload, catchData])
  // render only when data and connectBtnHandler aren't null
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className='content'>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/Upload/" element={<Upload web3Api={web3Api} contract={contract} data={data} />} />
            <Route exact path="/MyArt/" element={<MyArt web3Api={web3Api} contract={contract} data={data} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
