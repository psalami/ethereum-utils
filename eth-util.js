var web3 = require('ethereum.js');
var fs = require('fs');



var args = process.argv.slice(2);
var printHelp = function(){
	console.log("usage: eth-uil.js [command] [args]");
	console.log("compile [fileName] - compiles the specified file");
	console.log("deploy [fileName] - compiles the specified file and creates a contract on the blockchain");
    console.log("cmd [contract address] [path to abi] [command] [args*] - calls a method on a contract (i.e. cmd 0x3d8ef... simple-storage.abi set 40)");
	console.log("watch-blocks - prints current block number whenever a new block is created");
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
		compiled = web3.eth.solidity(fileContents);
	}

	return compiled;
}

var deploy = function(byteCode){
	var address = web3.eth.transact({code: byteCode});
	return address;
}


var watchBlocks = function(){
	console.log("current block: " + web3.eth.number);
	web3.eth.watch('chain').changed(function(res){
		console.log("current block: " + web3.eth.number);
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


web3.setProvider(new web3.providers.HttpSyncProvider('http://localhost:8080'));

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
	var result = web3.eth.codeAt(address);
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

	var contract = web3.eth.contract(address, abi);

	var contract_cmd_args = args.slice(4);
	if(contract_cmd_args.length > 0){
        var result = contract[contract_cmd].apply(null, contract_cmd_args);
    } else {
        var result = contract.call()[contract_cmd]();
    }

	if(result){
		console.log(result.toNumber());
	}
	process.exit(0);
}

if(cmd == "watch-blocks"){
	watchBlocks();
}
