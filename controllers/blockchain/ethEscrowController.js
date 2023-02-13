//This module help to listen req
let express = require("express");
let router = express.Router();
let axios = require("axios");
const Web3 = require("web3");
const web3 = new Web3();
const Tx = require('ethereumjs-tx').Transaction;
const InputDataDecoder = require('ethereum-input-data-decoder');
const {XMLHttpRequest} = require('xmlhttprequest');

web3.setProvider(
	new web3.providers.HttpProvider(
		// "https://speedy-nodes-nyc.moralis.io/d67ea2c319957b719814f79a/eth/rinkeby"
		"https://rinkeby.infura.io/v3/0a48491f07ee459a9528d0942444bafa"
	)
);
let abi = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "GetSeller_Buyer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "confirmDeliveryy", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "confirmDelivery", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "currState", "outputs": [{ "internalType": "enum Escrow.State", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "deposit", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "dispute_Delivery", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "address payable", "name": "_buyer", "type": "address" }, { "internalType": "address payable", "name": "_seller", "type": "address" }], "name": "getSeller_Buyer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "trading_data", "outputs": [{ "internalType": "address payable", "name": "seller", "type": "address" }, { "internalType": "address payable", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bool", "name": "isPaid", "type": "bool" }], "stateMutability": "view", "type": "function" }]
const decoder = new InputDataDecoder(abi)
let contractAddress = "0xD78D232C534f56cbB280A199A864d36192F248B6";
//******************************************** */ SET SELLER & BUYER ***************************************************************
//setuser
exports.setUser = async  (req, res) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;

	try {
		if (req.body) {
			let ValidationCheck = true;
			if (!req.body.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.seller_address) {
				ResponseMessage = "seller address is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.buyer_address) {
				ResponseMessage += "buyer address is missing \n";
				ValidationCheck = false;
			}

			if (!req.body.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			} else if (!req.body.value === parseInt(req.body.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck === true) {
				let tradingId = req.body.trading_id;
				let sellerAddress = req.body.seller_address;
				let privateKey = req.body.from_private_key;
				let buyerAddress = req.body.buyer_address;
				let fromAddress = req.body.from_address;


				if (sellerAddress.length < 42) {
					ResponseMessage = "Invalid seller Address";
					ResponseCode = 400;
					return;
				} else if (buyerAddress.length < 42) {
					ResponseMessage = "Invalid buyer Address";
					ResponseCode = 400;
					return;
				} else if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}



				web3.eth.defaultAccount = fromAddress;
				let contract = new web3.eth.Contract(abi, contractAddress);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = contract.methods.getSeller_Buyer(tradingId, buyerAddress, sellerAddress).encodeABI();


				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				// let xmlHttp = new XMLHttpRequest();
				// xmlHttp.open( "GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
				// 	contractAddress +
				// 	"&address=" +
				// 	fromAddress +
				// 	"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous req
				// xmlHttp.send();
				//let transactions = JSON.parse(xmlHttp.responseText);

				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(200000000000),
					"gasLimit": web3.utils.toHex(gasLimit),

					"to": contractAddress,
					"data": data,
					//"chainId": 0x04
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				console.log("This is tx", tx);

				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				console.log("This is serial", serializedTx);
				let hashObj = await sendrawtransaction(serializedTx);
				if (hashObj.res === '') {
					let hash = hashObj.hash;
					ResponseData = await getTransactionn(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = hashObj.res;
					ResponseCode = 400;
					
				}

			}

		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	} finally {
		 res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};

// ************************************ DEPOSIT VALUE IN ESCROW *************************************************************************************************
//depositeth
exports.depositEth = async  (req, res) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;

	try {
		if (req.body) {
			let ValidationCheck = true;
			if (!req.body.value) {
				ResponseMessage = "value is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			else if (!req.body.value === parseInt(req.body.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck == true) {

				let tradingId = req.body.trading_id;
				let Value = req.body.value;
				let privateKey = req.body.from_private_key;

				let fromAddress = req.body.from_address;


				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}



				web3.eth.defaultAccount = fromAddress;


				let contract = new web3.eth.Contract(abi, contractAddress);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = contract.methods.deposit(tradingId).encodeABI();
				//console.log(data);

				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					contractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false); // false for synchronous req
				xmlHttp.send();
				let transactions = JSON.parse(xmlHttp.responseText);

				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(2000000000000),
					"gasLimit": web3.utils.toHex(gasLimit),
					"value": web3.utils.toHex(web3.utils.toWei(Value, "ether")),

					"to": contractAddress,
					//"to": toAddress,
					"data": data,
					//"chainId": 0x04
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				console.log("This is tx", tx);

				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);
				console.log("This is hashobj", hashObj);

				if (hashObj.res == '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = hashObj.res;
					ResponseCode = 400;
					return;
				}


			}

		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	} finally {
		return res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};
//================= Deposit end====================================



// ********************************* RELEASE VALUE FROM ESCROW ************************************************************************************
//deliveryeth
exports.deliveryEth = async (req, res) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;

	try {
		if (req.body) {
			let ValidationCheck = true;

			if (!req.body.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}


			if (ValidationCheck == true) {
				let tradingId = req.body.trading_id;
				let privateKey = req.body.from_private_key;

				let fromAddress = req.body.from_address;


				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}
				web3.eth.defaultAccount = fromAddress;
				let contract = new web3.eth.Contract(abi, contractAddress);
				//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = contract.methods.confirmDelivery(tradingId).encodeABI();
				//console.log(data);

				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					contractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false); // false for synchronous req
				xmlHttp.send();
				let transactions = JSON.parse(xmlHttp.responseText);

				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(200000000000),
					"gasLimit": web3.utils.toHex(gasLimit),
					//	"value": web3.utils.toHex(web3.utils.toWei(Value, "ether")),

					"to": contractAddress,
					//"to": toAddress,
					"data": data,
					"chainId": 0x04
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				console.log("This is tx", tx);

				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);
				console.log("This is hashobj", hashObj);

				if (hashObj.res == '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = hashObj.res;
					ResponseCode = 400;
					return;
				}


			}

		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	} finally {
		 res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};
//=================+======================== Release value end ====================================

// ===============================================================================================================================================

//=================+======================== Dispute starts ====================================

//disputeEth
exports.disputeEth = async (req, res) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	
	try {
		if (req.body) {
			let ValidationCheck = true;
			
			if (!req.body.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			if (!req.body.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			
			
			if (ValidationCheck === true) {
				let tradingId = req.body.trading_id;
				let privateKey = req.body.from_private_key;
				
				let fromAddress = req.body.from_address;
				
				
				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}
				web3.eth.defaultAccount = fromAddress;
				let contract = new web3.eth.Contract(abi, contractAddress);
				//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = contract.methods.dispute_Delivery(tradingId).encodeABI();
				//console.log(data);
				
				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				
				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					contractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false); // false for synchronous req
				xmlHttp.send();
				let transactions = JSON.parse(xmlHttp.responseText);
				
				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(200000000000),
					"gasLimit": web3.utils.toHex(gasLimit),
					//	"value": web3.utils.toHex(web3.utils.toWei(Value, "ether")),
					
					"to": contractAddress,
					//"to": toAddress,
					"data": data,
					"chainId": 0x04
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				console.log("This is tx", tx);
				
				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);
				console.log("This is hashobj", hashObj);
				
				if (hashObj.res == '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = hashObj.res;
					ResponseCode = 400;
					return;
				}
				
				
			}
			
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	} finally {
		res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};



//===========================================Dispute ends here ===============================================//

// ===============================================================================================================================================




///getBalance/:walletAddress
exports.getBalance = async (req, res) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		if (req.params) {
			if (!req.params.walletAddress) {
				ResponseMessage = "wallet address is missing \n";
				ResponseCode = 206;
			} else {
				let walletAddress = req.params.walletAddress;
				let date = new Date();
				let timestamp = date.getTime();
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				// let xmlHttp = new XMLHttpRequest();
				// xmlHttp.open( "GET",  "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
				// 	contractAddress +
				// 	"&address=" +
				// 	walletAddress +
				// 	"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous req
				// xmlHttp.send();
				let transactions = JSON.parse(xmlHttp.responseText);
				let balance = transactions.result;
				//balance = balance / 10 ** 6;
				balance = balance;
				ResponseData = {
					wallet: {
						balance: balance
					},
					message: "",
					timestamp: timestamp,
					status: 200,
					success: true
				};
				ResponseMessage = "Completed";
				ResponseCode = 200;
			}
		} else {
			ResponseMessage = "Transaction cannot proceeds as req params is empty";
			ResponseCode = 204;
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		return res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}

};
// ===========================================================================================================================================================






function getTransaction(hash) {
	let data;
	return new Promise(function (resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			console.log("This is transaction", transaction);
			console.log("This is transaction error ", err);
			let date = new Date();
			let timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input);
			console.log("This is input ", inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					// buyer: inputdecode.inputs[0],
					// seller: inputdecode.inputs[1],
					//	amount: parseInt(inputdecode.inputs[1]) ,
					//	amount: parseInt(inputdecode.inputs[0]),
					//currency: "USDT",
					fee: transaction.gasPrice,
					n_confirmation: transaction.transactionIndex,
					link: `https://rinkeby.etherscan.io/tx/${hash}`
				},
				message: "",
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		})
	});
}

function getTransaction(hash) {
	let data;
	return new Promise(function (resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			console.log("This is transaction", transaction);
			console.log("This is transaction error ", err);
			let date = new Date();
			let timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input);
			console.log("This is input ", inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					Value : transaction.value / 10 ** 18,
					// buyer: inputdecode.inputs[0],
					// seller: inputdecode.inputs[1],
					//	amount: parseInt(inputdecode.inputs[1]) ,
					//	amount: parseInt(inputdecode.inputs[0]),
					//currency: "USDT",
					fee: transaction.gasPrice,
					n_confirmation: transaction.transactionIndex,
					link: `https://rinkeby.etherscan.io/tx/${hash}`
				},
				message: "",
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		})
	});
}

function getTransactionn(hash) {
	let data;
	return new Promise(function (resolve, reject) {
		console.log("This is hash", hash);
		web3.eth.getTransaction(hash, function (err, transaction) {
			console.log("This is transaction ", transaction);
			console.log("This is error", err);
			let date = new Date();
			let timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input)
			//web3.utils.toAscii(transaction.input);
			//decoder.decodeData(transaction.input);
			console.log("This is input ", inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					id: parseInt(inputdecode.inputs[0]._hex, 16),
					//parseInt(hexString, 16)

					buyer: inputdecode.inputs[1],
					seller: inputdecode.inputs[2],
					// yourNumber = parseInt(hexString, 16);
					//	amount: parseInt(inputdecode.inputs[1]) ,
					//	amount: parseInt(inputdecode.inputs[0]),
					//currency: "USDT",
					fee: transaction.gasPrice,
					n_confirmation: transaction.transactionIndex,
					link: `https://rinkeby.etherscan.io/tx/${hash}`
				},
				message: "",
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		})
	});
}

function sendrawtransaction(serializedTx) {
	let hash;
	let res = "";
	return new Promise(function (resolve, reject) {
		web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"), function (err, hsh) {
			if (err) {
				res = `send Bad Request ${err}`;
			} else {
				hash = hsh;
			}
			let obj = {
				res: res,
				hash: hash
			};
			resolve(obj);
		});
	});
}

