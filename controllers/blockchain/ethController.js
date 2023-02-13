//This module help to listen req
let express = require('express');
let router = express.Router();
const axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3();
//const Tx = require("ethereumjs-tx");
const Tx = require('ethereumjs-tx').Transaction;
const Wallet = require('../../models/walletModel')
const Web3EthAccounts = require('web3-eth-accounts');

web3.setProvider(
	new web3.providers.HttpProvider(
		// 'https://speedy-nodes-nyc.moralis.io/d67ea2c319957b719814f79a/eth/rinkeby'
		// "https://rinkeby.infura.io/t2utzUdkSyp5DgSxasQX"
		"https://rinkeby.infura.io/v3/0cf6ce13281c413eb0aa36c6921c24fb"
	)
);

// ---------------------------------Create Account----------------------------------------------
exports.createWallet = async ( req, res,next ) => {
	
	const isWalletExist = await Wallet.findOne({user: req.user._id});
	
	if ( isWalletExist ) {
		return res.status(201).json({
			status: 'success',
			message: ' Your wallet already exist'
		});
	}
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		let account = new Web3EthAccounts('https://rinkeby.infura.io/v3/07b0f2fe4e234ceea0ff428f0d25326e');
		
		let wallet = account.create();

		let walletAddress = wallet.address;
		// const count = await web3.eth.getTransactionCount(walletAddress);

		let date = new Date();
		let timestamp = date.getTime();
		
		ResponseData = {
			wallet: {
				private: wallet.privateKey,
				public: wallet.address,
				currency: 'ETH',
				create_date: date,
				sent: 0,
				received: 0,
				link: `https://www.etherscan.io/account/${walletAddress}`
			},
			message: '',
			timestamp: timestamp,
			status: 200,
			success: true
		};
	
	const createWallet = await Wallet.create({user:req.user._id,wallet: {...ResponseData.wallet}})
		
	
		ResponseMessage = 'Completed';
		ResponseCode = 200;
		res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	} catch ( error ) {
	
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
		next(error)
	}
	
	
	
};

//-----------------------------Get Balance of Account----------------------------------------------
//getBalance/:walletAddress"
exports.getAccountsBalance = async ( req, res ) => {
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	try {
		if ( req.params ) {
			if ( !req.params.walletAddress ) {
				ResponseMessage = 'wallet address is missing \n';
				ResponseCode = 206;
			} else {
				let walletAddress = req.params.walletAddress;
				
				if ( walletAddress.length < 42 ) {
					ResponseMessage = 'Invalid Wallet Address';
					ResponseCode = 400;
					return;
				}

				const balance = await web3.eth.getBalance(walletAddress);

				const weiBalance = web3.utils.fromWei(balance, 'ether');
				let date = new Date();
				let timestamp = date.getTime();
				let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
				
				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open('GET', 'http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=' + walletAddress + '&startblock=0&endblock=99999999&sort=asc', false); // false for synchronous req
				xmlHttp.send();
				let transactions = JSON.parse(xmlHttp.responseText);
				
				let sent = 0;
				let received = 0;
				console.log('======>length', transactions?.result?.length);
				for ( let i = 0; i < transactions.result.length; i++ ) {
					String(transactions.result[i].from)
						.toUpperCase()
						.localeCompare(String(walletAddress).toUpperCase()) === 0 ?
						(sent += 1) :
						String(transactions.result[i].to)
							.toUpperCase()
							.localeCompare(String(walletAddress).toUpperCase()) === 0 ?
							(received += 1) :
							'';
				}

				ResponseData = {
					wallet: {
						address: walletAddress,
						currency: 'ETH',
						balance: weiBalance,
						create_date: date,
						sent: sent,
						received: received,
						link: `https://www.etherscan.org/account/${walletAddress}`
					},
					message: '',
					timestamp: timestamp,
					status: 200,
					success: true
				};
				console.log('-------->', ResponseData );

				ResponseMessage = 'Completed';
				ResponseCode = 200;
			}
		} else {
			ResponseMessage = 'Transaction cannot proceeds as req params is empty';
			ResponseCode = 204;
		}
	} catch ( error ) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};

//transfer balance of ethereum
exports.trasnferBalance = async ( req, res ) => {
	
	let ResponseCode = 200;
	let ResponseMessage = ``;
	let ResponseData = null;
	
	try {
		if ( req.body ) {
			let ValidationCheck = true;
			if ( !req.body.from_address ) {
				ResponseMessage = 'from address is missing \n';
				ValidationCheck = false;
			}
			if ( !req.body.to_address ) {
				ResponseMessage += 'to address is missing \n';
				ValidationCheck = false;
			}
			if ( !req.body.from_private_key ) {
				ResponseMessage += 'private key is missing \n';
				ValidationCheck = false;
			}
			if ( !req.body.value ) {
				ResponseMessage += 'value is missing \n';
				ValidationCheck = false;
			}
			// else if (!req.body.value === parseInt(req.body.value)) {
			// 	ResponseMessage += "value must be a number \n";
			// 	ValidationCheck = false;
			// }
			
			if ( ValidationCheck == true ) {
				
				let fromAddress = req.body.from_address;
				let privateKey = req.body.from_private_key;
				let toAddress = req.body.to_address;
				let etherValue = req.body.value;
				
				if ( fromAddress.length < 42 ) {
					ResponseMessage = 'Invalid From Address';
					ResponseCode = 400;
					return;
				} else if ( toAddress.length < 42 ) {
					ResponseMessage = 'Invalid To Address';
					ResponseCode = 400;
					return;
				}
				etherValue = web3.utils.toWei(etherValue, 'ether');
				web3.eth.defaultAccount = fromAddress;
				
				let count = await web3.eth.getTransactionCount(fromAddress, 'latest');
				let gasPriceObj = await getgasprice(web3.eth.defaultAccount);
				
				if ( gasPriceObj.response == '' ) {
					let gasPrice = gasPriceObj.gasprice;
					let gasLimit = 21000;
					// let gasLimit = web3.utils.toHex(1000000); // Raise the gas limit to a much higher amount
					//  let gasPrice = web3.utils.toHex(web3.utils.toWei('1', 'gwei'));
					privateKey = Buffer.from(privateKey, 'hex');
					let rawTransaction = {
						from: fromAddress,
						to: toAddress,
						nonce: web3.utils.toHex(count),
						gasPrice: web3.utils.toHex(2000000000),
						gasLimit: web3.utils.toHex(6721975),
						// nonce: count,
						// gasPrice: gasPrice,
						// gasLimit: gasLimit,
						// to: toAddress,
						value: web3.utils.toHex(etherValue),
						//value: etherValue,
						//chainId: 0x04
						// chainId: 0x5f
					};
					//console.log('2nd')
					let tx = new Tx(rawTransaction, {'chain': 'rinkeby'});
					
					tx.sign(privateKey);
					
					let serializedTx = tx.serialize();
					//console.log('3rd')
					//ResponseMessage ='3rd'; 
					let hashObj = await sendSignedTransaction(serializedTx);
					
					if ( hashObj.response == '' ) {
						let hash = hashObj.hash;
						ResponseData = await getTransaction(hash);
						ResponseMessage = 'Transaction successfully completed';
						ResponseCode = 200;
					} else {
						ResponseMessage = hashObj.response;
						ResponseCode = 400;
						return;
					}
				} else {
					ResponseMessage = gasPriceObj.response;
					ResponseCode = 400;
					return;
				}
			} else {
				ResponseCode = 206;
			}
		} else {
			ResponseMessage = 'Transaction cannot proceeds as req body is empty';
			ResponseCode = 204;
		}
		
	} catch ( error ) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		res.status(200).json({
			code: ResponseCode,
			data: ResponseData,
			msg: ResponseMessage
		});
	}
};

function getTransaction ( hash ) {
	let data;
	return new Promise(async function ( resolve, reject ) {
		await web3.eth.getTransaction(hash, function ( err, transaction ) {
			console.log('this is trans', transaction);
			let date = new Date();
			let timestamp = date.getTime();
			let conf = web3.eth.getBlock('latest').number - transaction.blockNumber;
			data = {
				transaction: {
					hash: transaction.hash,
					currency: 'ETH',
					from: transaction.from,
					to: transaction.to,
					amount: transaction.value / 10 ** 18,
					fee: transaction.gasPrice,
					n_confirmation: conf,
					block: transaction.blockNumber,
					link: `https://www.etherchain.org/tx/${hash}`
				},
				message: '',
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		});
	});
}

function getgasprice () {
	let gasprice;
	let response = '';
	return new Promise(function ( resolve, reject ) {
		web3.eth.getGasPrice(function ( err, gsPrice ) {
			if ( err ) {
				response = `Gas Bad Request ${err}`;
			} else {
				gasprice = gsPrice;
			}
			let obj = {
				response: response,
				gasprice: gasprice
			};
			resolve(obj);
		});
	});
}

function sendSignedTransaction ( serializedTx ) {
	let hash;
	let response = '';
	return new Promise(function ( resolve, reject ) {
		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function ( err, txHash ) {
			if ( err ) {
				response = `send Bad Request ${err}`;
			} else {
				hash = txHash;
			}
			let obj = {
				response: response,
				hash: hash
			};
			resolve(obj);
		});
		
		//  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
		// 	console.log('err:', err, 'txHash:', txHash)
		// 	// Use this txHash to find the contract on Etherscan!
		//   })
	});
}

//-----------------------------Get Transaction----------------------------------------------

exports.transactionHash = async ( request, res ) =>{
var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;
	try {
		if(request.params) {
			if (!request.params.hash) {
				ResponseMessage = "hash / wallet address is missing \n";
				ResponseCode = 206;
			} else {
				let hash = request.params.hash;
				if (hash.length == 66) {
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Completed";
					ResponseCode = 200;
				} else if (hash.length == 42) {
					
					let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open( "GET", 'http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=' + hash + '&startblock=0&endblock=99999999&sort=asc&limit=100', false ); // false for synchronous request
					xmlHttp.send();
					var transactions = JSON.parse(xmlHttp.responseText);
					console.log('========>', transactions)

					for (let i = 0; i < transactions.result.length; i++) {
						transactions.result[i].value = transactions.result[i].value / 10 ** 18;
					}
					ResponseData = {
						transaction: transactions.result
					};
					ResponseMessage = "Completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = "Invalid Hash or Wallet Address"
					ResponseCode = 400;
				}
			}
		} else {
			ResponseMessage = "Transaction cannot proceeds as request params is empty";
			ResponseCode = 204;
		}
	} catch(error) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		return res.status(200).json({
			code : ResponseCode,
			data : ResponseData,
			msg : ResponseMessage
		});
	}

};