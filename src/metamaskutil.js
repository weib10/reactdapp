// import React, { useState } from "react";
// import Web3 from "web3";
// import "./App.css";

// /*
// *   use this api to connect to the account ny the metamask
// */
// function MetamaskConnector() {
//     // data contain the data from metamask, including account's address, balance, and the networkName
//     const [data, setData] = useState({
//         address: "",
//         Balance: null,
//         networkName: ""
//     });

//     // load the web3
//     let web3;
//     if (window.ethereum) {
//         web3 = new Web3(window.ethereum);
//     } else {
//         console.error("No metamask extension detected!");
//         alert("Please install metamask extension!!");
//         return;
//     }

//     const getNetworkName = async () => {
//         try {
//             const chainId = await web3.eth.getChainId();
//             const chainIdHex = '0x' + chainId.toString(16);
//             console.log(chainIdHex)
//             const networkName = getNetworkNameByChainId(chainIdHex);
//             setData(prevState => ({
//                 ...prevState,
//                 networkName
//             }));
//         } catch (error) {
//             console.error("Error getting network name:", error);
//         }
//     }

//     const getNetworkNameByChainId = (chainId) => {
//         switch (chainId) {
//             case "0x1": return "Ethereum Mainnet";
//             case "0x5": return "Goerli Testnet";
//             case "0xaa36a7": return "Sepolia Testnet";
//             case "0x4268": return "Holesky Testnet";
//             case "0x539": return "Ganache";
//             // Add other networks as needed, for example:
//             default: return "Unknown Network";
//         }
//     }

//     const getBalance = async (address) => {
//         try {
//             const balance = await web3.eth.getBalance(address);
//             console.log(Web3.utils.fromWei(balance, 'ether'));
//             setData(prevState => ({
//                 ...prevState,
//                 Balance: Web3.utils.fromWei(balance, 'ether')
//             }));
//         } catch (error) {
//             console.error("Error getting balance:", error);
//         }
//     };

//     const getAccount = async () => {
//         try {
//             const accounts = await web3.eth.requestAccounts();
//             setData(prevState => ({
//                 ...prevState,
//                 address: accounts[0]
//             }));
//             getBalance(accounts[0]);
//         } catch (error) {
//             console.error("Error getting accounts:", error);
//         }
//     }

//     const connectHandler = async () => {
//         await getNetworkName();
//         await getAccount();
//     };

//     return {
//         web3,
//         data,
//         connectHandler,
//     };
// }


// export default MetamaskConnector;