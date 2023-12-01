import Web3 from "web3";

// 錢包位置 之後改掉
let account = "0x28e7f96D791400cC1Ca01961280C23fec4aafD84";
const setAccount = async(acc) => {
    account = acc;
}
// 連接到infura
let netURLname = 'Goerli';
let web3;
const infuraApiKey = 'da4abffeda8b4d58a84519dfb85e73d7';
// connecting to infura by the given choosen network
const connectToNetwork = (networkName) => {
    netURLname = networkName || netURLname;  // 如果提供了新的网络名，则更新 netURLname
    const ProviderURL = `https://${netURLname}.infura.io/v3/${infuraApiKey}`;
    web3 = new Web3(new Web3.providers.HttpProvider(ProviderURL));
}
// 先連一次
connectToNetwork();

const getNetName = async () => {
    try {
        const id = await web3.eth.net.getId();
        const idnum = Number(id.toString())
        if(idnum === 1){
            return 'Mainnet'
        }else if (idnum === 11155111) {
            return 'Sepolia'
        } else if(idnum === 5){
            return 'Goerli'
        }else if(idnum === 17000){
            return 'Holesky'
        }
    } catch (error) {
        console.error(error);
        return 0;
    }
}

const getBalance = async (acc) => {
    try {
        const bal = await web3.eth.getBalance(acc);
        const ethbalance = web3.utils.fromWei(bal, 'ether');
        const formattedBalance = parseFloat(ethbalance).toFixed(4);
        return Number(formattedBalance);
    } catch (error) {
        console.error(error);
        return 'error';
    }
}
    
export {
    account,
    setAccount,
    connectToNetwork,
    getNetName,
    getBalance,
}