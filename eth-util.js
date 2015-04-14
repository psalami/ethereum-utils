#!/usr/local/bin/node
var web3 = require('ethereum.js');
var fs = require('fs');



var args = process.argv.slice(2);
var printHelp = function(){
	console.log("usage: eth-uil.js [command] [args]");
	console.log("compile [fileName] - compiles the specified file");
	console.log("deploy [fileName] - compiles the specified file and creates a contract on the blockchain");
    console.log("cmd [contract address] [path to abi] [command] [args*] - calls a method on a contract (i.e. cmd 0x3d8ef... simple-storage.abi set 40)");
	console.log("watch-blocks - prints current block number whenever a new block is created");
    console.log("address - shows the address of the first account owned by the connected Ethereum node");
    console.log("balance - shows the current balance of the first account owned by the connected Ethereum node");
    console.log("send-ether [amount] [recipient] - sends ether to the specified address");
}

var compileFile = function(fileName){
	var detectFileType = function(fileName){
		var fileParts = fileName.split('.');
		var extension = fileParts[fileParts.length - 1];
		if(extension == "sol"){
			return "solidity";
		}else if(extension == "se"){
			return "serpent";
		}else if(extension == "lll"){
			return "lll";
		}else{
			console.log("unknown file type: " + extension);
			process.exit(1);
		}
	}

	var fileType = detectFileType(fileName);
	var fileContents = fs.readFileSync(fileName, {encoding: "utf8"});
	console.log("compiling " + fileType + " code at " + fileName + "...");
	
	var compiled;
	if(fileType == "solidity"){
		compiled = web3.eth.compile.solidity(fileContents);
	}

	return compiled;
}

var deploy = function(byteCode){
	var address = web3.eth.sendTransaction({data: byteCode});
	return address;
}

/*
 , function(err, address){
 if(err){
 console.log("error:");
 console.log(err);
 }else{
 console.log("== ADDRESS:");
 console.log(address);
 }
 }
 */


var watchBlocks = function(){
	console.log("current block: " + web3.eth.blockNumber);
	web3.eth.filter('chain').watch(function(res){
        var numTransactions = web3.eth.getBlockTransactionCount(web3.eth.blockNumber);
        var block = web3.eth.getBlock(web3.eth.blockNumber);
        console.log("-- " + web3.eth.blockNumber + " --");
        console.log("numTransactions: " + numTransactions);
        console.log(block);
    });
}

var watchPending = function(){
    web3.eth.defaultBlock = 0;
    web3.eth.filter('pending').watch(function(res){
        console.log("block: " + web3.eth.blockNumber);
        var numTransactions = web3.eth.getBlockTransactionCount(web3.eth.blockNumber);
        console.log("num transactions: " + numTransactions)
        for(var i = 0; i < numTransactions; i++){
            var tx = web3.eth.getTransaction(web3.eth.blockNumber, i);
            console.log("from: " + tx["from"]);
            console.log("to: " + tx["to"]);
        }
    });
}

if(args.length == 0){
	printHelp();
	process.exit(1);
}

var cmd = args[0];

if(cmd == "help"){
	printHelp();
	process.exit(0);
}

var port = 8080;
if(typeof process.env.PORT != "undefined"){
    port = process.env.PORT;
}
var host = "127.0.0.1";
if(typeof process.env.HOST != "undefined"){
    host = process.env.HOST;
}

web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

if(cmd == "compile"){
	if(args.length < 2){
		printHelp();
		process.exit(1);
	}
	var fileName = args[1];
	var result = compileFile(fileName);
	if(result){
		console.log("compilation successful");
		console.log(result);
		process.exit(0);
	}else{
		console.log("compilation error");
		process.exit(1);
	}
}

if(cmd == "deploy"){
	if(args.length < 2){
		printHelp();
		process.exit(1);
	}
	var fileName = args[1];
	var result = compileFile(fileName);
    //var result = fs.readFileSync(fileName, {encoding: "utf8"});
	if(result){
		console.log("compilation successful");
		console.log("deploying code to blockchain...");
		var address = deploy(result);
		console.log("deployed contract at " + address);
		process.exit(0);
	}else{
		console.log("compilation error");
		process.exit(1);
	}
}

if(cmd == "check-contract"){
	if(args.length < 2){
		printHelp();
		process.exit(1);
	}

	var address = args[1];
	var result = web3.eth.getCode(address);
	if(web3.toAscii(result)){
		console.log("true");
	}else{
		console.log("false");
	}
	process.exit(0);
}

if(cmd == "cmd"){
	if(args.length < 4){
		printHelp();
		process.exit(1);
	}

	var address = args[1];
	var abi = JSON.parse(fs.readFileSync(args[2], {encoding: "utf8"}));
    var contract_cmd = args[3];

    var contractClass = web3.eth.contract(abi);
	var contract = new contractClass(address);

	var contract_cmd_args = args.slice(4);
	if(contract_cmd_args.length > 0){
        var result = contract[contract_cmd].apply(null, contract_cmd_args);
    } else {
        var result = contract.call()[contract_cmd]();
    }

	if(result){
		console.log(result);

	}
	process.exit(0);
}

if(cmd == "watch-blocks"){
	watchBlocks();
}

if(cmd == "watch-pending"){
    watchPending();
}

if(cmd == "balance"){
    console.log(web3.eth.getBalance(web3.eth.accounts[0]).toNumber());
    process.exit(0);
}

if(cmd == "address"){
    console.log(web3.eth.accounts[0]);
    process.exit(0);
}

if(cmd == "send-ether"){
    if(args.length < 2){
        printHelp();
        process.exit(1);
    }

    var amount = web3.toWei(args[1], "ether");
    var address = args[2];
    web3.eth.sendTransaction({to:address, value:amount});
    process.exit(0);
}
