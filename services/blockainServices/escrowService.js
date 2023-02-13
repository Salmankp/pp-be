//This module help to listen req
let express = require("express");
let router = express.Router();
let axios = require("axios");
const Web3 = require("web3");
const web3 = new Web3();
const Tx = require('ethereumjs-tx').Transaction;
const InputDataDecoder = require('ethereum-input-data-decoder');
const { XMLHttpRequest } = require('xmlhttprequest');

web3.setProvider(
	new web3.providers.HttpProvider(
		// "https://speedy-nodes-nyc.moralis.io/d67ea2c319957b719814f79a/eth/rinkeby"
		// "https://rinkeby.infura.io/v3/0a48491f07ee459a9528d0942444bafa"
		"https://rinkeby.infura.io/v3/07b0f2fe4e234ceea0ff428f0d25326e"
	)
);
let abi = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "GetSeller_Buyer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "confirmDeliveryy", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "confirmDelivery", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "currState", "outputs": [{ "internalType": "enum Escrow.State", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "deposit", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "dispute_Delivery", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "address payable", "name": "_buyer", "type": "address" }, { "internalType": "address payable", "name": "_seller", "type": "address" }], "name": "getSeller_Buyer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "trading_data", "outputs": [{ "internalType": "address payable", "name": "seller", "type": "address" }, { "internalType": "address payable", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bool", "name": "isPaid", "type": "bool" }], "stateMutability": "view", "type": "function" }]
const decoder = new InputDataDecoder(abi)
let contractAddress = "0xD78D232C534f56cbB280A199A864d36192F248B6";


//USDT_address and Abi

let Abi = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]
const Decoder = new InputDataDecoder(Abi)
var ContractAddress = "0x3c7641928E68352902F702A6bfb1E9A3A140E3f8";


//******************************************** */ SET SELLER & BUYER ***************************************************************
//setuser
exports.setUser = async (values) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		if (values) {
			let ValidationCheck = true;
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!values.seller_address) {
				ResponseMessage = "seller address is missing \n";
				ValidationCheck = false;
			}
			if (!values.buyer_address) {
				ResponseMessage += "buyer address is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			} else if (!values.value === parseInt(values.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck === true) {
				let tradingId = values.trading_id;
				let sellerAddress = values.seller_address;
				// let privateKey = values.from_private_key;
				let privateKeyVal = values.from_private_key;
				let privateKey = privateKeyVal.substring(privateKeyVal.indexOf('x')+1)
				let buyerAddress = values.buyer_address;
				let fromAddress = values.from_address;


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
				console.log('======>rawTransaction', rawTransaction);

				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });

				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);
				if (hashObj.res === '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = hashObj.res;
					ResponseCode = 400;

				}

			}
			console.log('======>response code', ResponseCode,
			ResponseData,
			ResponseMessage);

		}
		return ({
			ResponseCode,
			ResponseData,
			ResponseMessage
		})
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	}
};

exports.depositEth = async (values) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		if (values) {
			let ValidationCheck = true;
			if (!values.value) {
				ResponseMessage = "value is missing \n";
				ValidationCheck = false;
			}
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			else if (!values.value === parseInt(values.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck == true) {

				let tradingId = values.trading_id;
				let Value = values.value;

				let privateKeyVal = values.from_private_key;
				let privateKey = privateKeyVal.substring(privateKeyVal.indexOf('x') + 1)

				let fromAddress = values.from_address;


				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}
				web3.eth.defaultAccount = fromAddress;


				let contract = new web3.eth.Contract(abi, contractAddress);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = contract.methods.deposit(tradingId).encodeABI();

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
console.log('####@@@', tx);
				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);

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
			return ({
				code: ResponseCode,
				data: ResponseData,
				msg: ResponseMessage
			});
		}
	} catch (error) {
		return ({
			code: ResponseCode,
			data: error,
			msg: ResponseMessage
		});
	}
};

exports.deliveryEth = async (values) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;

	try {
		if (values) {
			let ValidationCheck = true;

			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (ValidationCheck == true) {
				let tradingId = values.trading_id;
				let privateKeyVal = values.from_private_key;
				let privateKey = privateKeyVal.substring(privateKeyVal.indexOf('x') + 1)

				let fromAddress = values.from_address;


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

				var buffer = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				tx.sign(buffer);


				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);

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

			return ({
				code: ResponseCode,
				data: ResponseData,
				msg: ResponseMessage
			});
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	}
};
exports.disputeEth = async (values) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		if (values) {
			let ValidationCheck = true;

			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			}
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}


			if (ValidationCheck === true) {
				let tradingId = values.trading_id;
				let privateKeyVal = values.from_private_key;
				let privateKey = privateKeyVal.substring(privateKeyVal.indexOf('x')+1)
				let fromAddress = values.from_address;


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

				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);

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

				console.log('ResponseDataResponseDataResponseData', ResponseData);

			}
			return ({
				code: ResponseCode,
				data: ResponseData,
				msg: ResponseMessage
			});
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	}
};

//USDTEscrow
exports.transferEscrow = async (values) => {
	var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;
	try {
		if (values) {
			var ValidationCheck = true;
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage = "from address is missing \n";
				ValidationCheck = false;
			}
			if (!values.to_address) {
				ResponseMessage += "to address is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.value) {
				ResponseMessage += "value is missing \n";
				ValidationCheck = false;
			} else if (!values.value === parseInt(values.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck == true) {
				let fromAddress = values.from_address;
				let privateKey = values.from_private_key;
				let toAddress = values.to_address;
				let tokenValue = values.value;


				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid From Address";
					ResponseCode = 400;
					return;
				} else if (toAddress.length < 42) {
					ResponseMessage = "Invalid To Address";
					ResponseCode = 400;
					return;
				}

				web3.eth.defaultAccount = fromAddress;
				//tokenValue = tokenValue * (10 ** 6);
				//  tokenValue = tokenValue;
				tokenValue = web3.utils.toWei(tokenValue, "ether");

				let Contract = new web3.eth.Contract(Abi, ContractAddress, {
					from: fromAddress
				});

				//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = Contract.methods.transfer(toAddress, tokenValue).encodeABI();

				console.log("====> ", data)
				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					ContractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false); // false for synchronous request
				xmlHttp.send();
				var transactions = JSON.parse(xmlHttp.responseText);
				let balance = transactions.result;

				//let balance = 1000000000000000000000000000000;
				console.log(balance);
				// if(balance >= tokenValue + gasLimit) {
				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(200000000000),
					"gasLimit": web3.utils.toHex(gasLimit),

					"to": ContractAddress,
					//"to": toAddress,
					"data": data,
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				
				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);
				console.log("ye hai hashobj =====>", hashObj);

				if (hashObj.response == '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					return ({
						code: ResponseCode,
						data: ResponseData,
						msg: ResponseMessage
					});
				}
				// } else {
				// 	ResponseMessage = "Balance is insufficent";
				// 	ResponseCode = 400;
				// 	return;
				// }

			} else {
				ResponseCode = 206
			}
		} else {
			ResponseMessage = "Transaction cannot proceeds as request body is empty";
			ResponseCode = 204
		}

	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error body me ni gya ${error}`;
		ResponseCode = 400
	} 

};

// =========================================== Escrow to Buyer ====================================================================================================



exports.transferBuyer = async (values) => {
	var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;

	try {
		if (values) {
			var ValidationCheck = true;
			if (!values.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_address) {
				ResponseMessage = "from address is missing \n";
				ValidationCheck = false;
			}
			if (!values.to_address) {
				ResponseMessage += "to address is missing \n";
				ValidationCheck = false;
			}
			if (!values.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!values.value) {
				ResponseMessage += "value is missing \n";
				ValidationCheck = false;
			} else if (!values.value === parseInt(values.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}

			if (ValidationCheck == true) {
				let fromAddress = values.from_address;
				let privateKey = values.from_private_key;
				let toAddress = values.to_address;
				let tokenValue = values.value;


				if (fromAddress.length < 42) {
					ResponseMessage = "Invalid From Address";
					ResponseCode = 400;
					return;
				} else if (toAddress.length < 42) {
					ResponseMessage = "Invalid To Address";
					ResponseCode = 400;
					return;
				}

				web3.eth.defaultAccount = fromAddress;
				//tokenValue = tokenValue * (10 ** 6);
				//  tokenValue = tokenValue;
				tokenValue = web3.utils.toWei(tokenValue, "ether");

				let Contract = new web3.eth.Contract(Abi, ContractAddress, {
					from: fromAddress
				});

				//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let data = Contract.methods.transfer(toAddress, tokenValue).encodeABI();

				console.log("====> ", data)
				let gasPrice = web3.eth.gasPrice;
				let gasLimit = 200000;
				//let gasLimit = web3.utils.toHex(6721975) ;
				var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					ContractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false); // false for synchronous request
				xmlHttp.send();
				var transactions = JSON.parse(xmlHttp.responseText);
				let balance = transactions.result;

				//let balance = 1000000000000000000000000000000;
				// if(balance >= tokenValue + gasLimit) {
				let rawTransaction = {
					"from": fromAddress,
					"nonce": web3.utils.toHex(count),
					"gasPrice": web3.utils.toHex(200000000000),
					"gasLimit": web3.utils.toHex(gasLimit),

					"to": ContractAddress,
					//"to": toAddress,
					"data": data,
				};
				privateKey = Buffer.from(privateKey, 'hex');
				let tx = new Tx(rawTransaction, { 'chain': 'rinkeby' });
				console.log(privateKey);
				tx.sign(privateKey);
				let serializedTx = tx.serialize();
				let hashObj = await sendrawtransaction(serializedTx);

				if (hashObj.response == '') {
					let hash = hashObj.hash;
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Transaction successfully completed";
					ResponseCode = 200;
				} else {
					return ({
						code: ResponseCode,
						data: ResponseData,
						msg: ResponseMessage
					});
				}
				
				// } else {
				// 	ResponseMessage = "Balance is insufficent";
				// 	ResponseCode = 400;
				// 	return;
				// }

			} else {
				ResponseCode = 206
			}
		} else {
			ResponseMessage = "Transaction cannot proceeds as request body is empty";
			ResponseCode = 204
		}

	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error body me ni gya ${error}`;
		ResponseCode = 400
	} 

};

function getTransaction(hash) {
	var data;
	return new Promise(function (resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			var date = new Date();
			var timestamp = date.getTime();
			let inputdecode = Decoder.decodeData(transaction.input);
			console.log("ye hai input ", inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					to: transaction.toAddress,
					// amount: tokenValue/10**18,
					amount: parseInt(inputdecode.inputs[1]) / 10 ** 18,
					currency: "USDT",
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
	var hash;
	var response = "";
	return new Promise(function (resolve, reject) {
		web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"), function (err, hsh) {
			if (err) {
				response = `send Bad Request ${err}`;
			} else {
				hash = hsh;
			}
			var obj = {
				response: response,
				hash: hash
			};
			resolve(obj);
		});
	});
}








// ===============================================================================================================================================

// ===========================================================================================================================================================


















function getTransaction(hash) {
	let data;
	return new Promise(function (resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			let date = new Date();
			let timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input)
			//web3.utils.toAscii(transaction.input);
			//decoder.decodeData(transaction.input);
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
