import React, { useEffect, useState } from 'react';
import './MyArt.css';

function MyArt({ web3Api, contract, data }) {
    const [myArtList, setMyArtList] = useState([]);
    const [earnings, setEarnings] = useState('0');
    const [purchasedArtList, setPurchasedArtList] = useState([]);

    useEffect(() => {
        const loadMyArt = async () => {
            try {
                const response = await contract.methods.getUserUploadedFiles().call({ from: data.address });
                // console.log(response);
                if (response && response[0].length != 0) {
                    const [titles, purchaseCounts] = [response[0], response[1]];
                    console.log(titles, purchaseCounts)
                    const artList = titles.map((title, index) => {
                        return { title, purchaseCount: Number(purchaseCounts[index]) };
                    });
                    setMyArtList(artList);
                    // console.log(artList)
                } else {
                    console.log('No creation');
                }

            } catch (error) {
                console.error("Error loading my art", error);
            }
        };

        const loadEarnings = async () => {
            try {
                const amount = await contract.methods.earnings(data.address).call();
                setEarnings(web3Api.utils.fromWei(amount, 'ether'));
            } catch (error) {
                console.error("Error loading earnings", error);
            }
        };

        const loadMyPurchased = async () => {
            try {
                const purchasedTitles = await contract.methods.getUserPurchasedFiles().call({ from: data.address });
                setPurchasedArtList(purchasedTitles);
            } catch (error) {
                console.error("Error loading your purchased art", error);
            }
        }

        if (contract && data.address) {
            loadMyArt();
            loadEarnings();
            loadMyPurchased();
        }
    }, [contract, data.address, web3Api]);


    const downloadFile = async (title) => {
        try {
            const fileHash = await contract.methods.getFileIpfsHash(title).call();
            const url = `http://localhost:8020/ipfs/${fileHash}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const withdrawEarnings = async () => {
        try {
            await contract.methods.withdraw().send({ from: data.address });
            alert("Earnings withdrawn successfully");
            setEarnings('0'); // Reset earnings after successful withdrawal
        } catch (error) {
            console.error("Error withdrawing earnings", error);
            alert("Error withdrawing earnings");
        }
    };

    return (
        <div className="MyArt">
            <div className='MyCreation'>
                <h2>My Creation</h2>
                {myArtList && myArtList.length > 0 ? (
                    <ul>
                        {myArtList.map(art => (
                            <li key={art.title}>{art.title} - Purchased {art.purchaseCount} times</li>
                        ))}
                    </ul>
                ) : (
                    <p>No creations found</p>
                )}
                <h4>Available Earnings: {earnings} ETH</h4>
                <button onClick={withdrawEarnings} disabled={earnings == '0.'}>Withdraw Earnings</button>

            </div>

            <div className='PurchasedArt'>
                <h2>Purchased Art</h2>
                {purchasedArtList.length > 0 ? (
                    <ul>
                        {purchasedArtList.map((title, index) => (
                            <li key={index}>
                                {title}
                                <button onClick={() => downloadFile(title)}>Download</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No purchased art found.</p>
                )}
            </div>

            <div>
            </div>
        </div>
    );
}

export default MyArt;
