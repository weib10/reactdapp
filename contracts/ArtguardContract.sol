// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// contract ArtGuard is Owned {

contract ArtGuard {
    address public owner;
    // titile => File Object
    mapping(string => File) private files;
    // owner's address => earnings
    mapping(address => uint) public earnings;
    // msg.sender => his files' titles
    mapping(address => string[]) public userUploadedFiles;
    mapping(address => string[]) public userPurchasedFiles;
    // 用戶帳號 and title => if he can access
    mapping(address => mapping(string => bool)) public accessGranted;

    struct File {
        string ipfsHash;
        uint price;
        uint purchaseCount;
        address owner;
    }

    constructor() {
        owner = msg.sender;
    }

    // used to receive money
    receive() external payable {}

    // 檢查合約餘額
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdraw() public {
        uint amount = earnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // 允許文件擁有者設定文件的IPFShash和價格
    function setFile(
        string memory title,
        string memory ipfsHash,
        uint price
    ) public {
        require(!isTitleTaken(title), "This title has been taken");
        files[title] = File(ipfsHash, price, 0, msg.sender);
        userUploadedFiles[msg.sender].push(title);
        // 讓上傳者也能access自己的作品
        userPurchasedFiles[msg.sender].push(title);
        accessGranted[msg.sender][title] = true;
    }

    // 檢查file是否撞名
    function isTitleTaken(string memory title) public view returns (bool) {
        return files[title].owner != address(0);
    }

    // 允許購買者支付並獲得文件訪問權限
    function purchaseFile(string memory title) public payable {
        File storage file = files[title];
        // 付的錢有達到定價
        require(msg.value >= file.price, "Insufficient payment");
        file.purchaseCount += 1;
        userPurchasedFiles[msg.sender].push(title);
        accessGranted[msg.sender][title] = true;
        earnings[file.owner] += msg.value;
    }

    // 查看定價
    function getFilePrice(string memory title) public view returns (uint) {
        return files[title].price;
    }

    // 取得用戶上傳的所有檔案title
    function getUserUploadedFiles()
        public
        view
        returns (string[] memory, uint[] memory)
    {
        string[] memory titles = userUploadedFiles[msg.sender];
        uint[] memory purchaseCounts = new uint[](titles.length);
        for (uint i = 0; i < titles.length; i++) {
            purchaseCounts[i] = files[titles[i]].purchaseCount;
        }
        return (titles, purchaseCounts);
    }

    function getUserPurchasedFiles() public view returns (string[] memory) {
        return userPurchasedFiles[msg.sender];
    }

    function getFileIpfsHash(
        string memory title
    ) public view returns (string memory) {
        return files[title].ipfsHash;
    }

    function hasAccess(string memory title) public view returns (bool) {
        return accessGranted[msg.sender][title];
    }

    //const instance = await ArtGuard.deployed()
    //instance.addFunds({from: accounts[0], value: "1000000000000000000"})
    //instance.withdraw("1000000000000000000", {from: accounts[1]})
    //instance.setFile('11', '123', '100000000000000000', {from: accounts[1]})
}
