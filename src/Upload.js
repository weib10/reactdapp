import React, { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import './Upload.css';

const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

function Upload({ web3Api, contract, data }) {
    const [file, setFile] = useState(null);
    const [buffer, setBuffer] = useState(null);
    const [ipfsHash, setIpfsHash] = useState(null)

    const [price, setPrice] = useState('');
    const [isValidPrice, setIsValidPrice] = useState(true);
    const [title, setTitle] = useState("")
    const [isValidTitle, setIsValidTitle] = useState(true);
    const [ifRepeated, setIfRepeated] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const chooseFile = (event) => {
        event.preventDefault();
        setFile(event.target.files[0]);
    }

    const uploadFile = (event) => {
        event.preventDefault();
        if (!file) {
            console.log('No file selected');
            return;
        }
        console.log('uploading')
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            // 在瀏覽器中，您可以直接使用reader.result，這將是一個ArrayBuffer。
            console.log('buffer', reader.result);
            setBuffer(reader.result);
        }
    }

    const handlePriceChange = (event) => {
        const value = event.target.value;
        // 使用正則表達式檢查輸入值是否為最多4位小數的正數且低於1000
        if (/^\d*\.?\d{0,4}$/.test(value)) {
            setPrice(value);
        }
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    useEffect(() => {
        const checkInput = async () => {
            // 檢查輸入內容
            const numericPrice = parseFloat(price);
            setIsValidPrice(numericPrice <= 1000 && numericPrice > 0);
            setIsValidTitle(title !== '');

            if (title && contract) {
                const ifTitleRepeated = await contract.methods.isTitleTaken(title).call();
                setIfRepeated(ifTitleRepeated);
            }
        }
        checkInput();
    }, [price, title, contract]);

    const uploadIPFS = async () => {
        setIsLoading(true); // 開始加載時設置為true
        setError(''); // 清除之前的錯誤
        if (isValidPrice && isValidTitle) {
            try {
                console.log('Uploading file to IPFS...')
                const added = await ipfs.add(buffer);
                console.log('IPFS result', added);
                setIpfsHash(added.path);
                setIsLoading(false);
            } catch (error) {
                console.error('Error uploading file:', error);
                setError(`Error uploading file: ${error.message}`); // 設置錯誤信息
                setIsLoading(false); // 發生錯誤時設置為false
            }
        } else {
            console.log("Invalid input or no file selected");
            setIsLoading(false);
        }
    }


    useEffect(() => {
        const doContractHere = async () => {
            if (ipfsHash && web3Api && contract && data.address) {
                try {
                    console.log('Signing the contract');
                    const priceToWei = web3Api.utils.toWei(price, 'ether');
                    await contract.methods.setFile(title, ipfsHash, priceToWei).send({ from: data.address });
                    console.log('File info set in contract.');
                } catch (error) {
                    console.error('Error in contract transaction:', error);
                    alert("Error in contract transaction: " + error.message);
                }
            }
        };
        doContractHere();
    }, [ipfsHash, web3Api, contract, data.address, price, title]);



    return (
        <div className="Upload">
            <h2>Upload your file here</h2>
            {isLoading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            {!buffer && (
                <form onSubmit={uploadFile}>
                    <input type="file" onChange={chooseFile} />
                    <button type="submit" className='uploadbtn'>Upload</button>
                </form>
            )}
            {ipfsHash && <p>File has been uploaded to IPFS</p>}
            <p>Set file price in ETH</p>
            <input type="text" value={price} onChange={handlePriceChange}
                placeholder='e.g. 0.1ETH' />
            {!isValidPrice && <p className="error price">Please enter valid price</p>}
            <p>Set file title</p>
            <input type="text" value={title} onChange={handleTitleChange}
                placeholder='e.g. First_creation'
                max={15} />
            {!isValidTitle && <p className="error title">Please enter valid title</p>}
            {ifRepeated && <p className='repeated title'>This title has already been enrolled</p>}
            <button className='Commit transaction'
                onClick={uploadIPFS}
                disabled={!file || !isValidPrice || !isValidPrice}>Confirm and commit the transaction
            </button>
        </div>
    );
}

export default Upload;
