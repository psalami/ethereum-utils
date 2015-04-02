#!/bin/bash

# starts local ethereum node #1
eth -L -d ~/.eth-cli-1 -l 30303 -n off -j --json-rpc-port 8080 -r 172.20.10.4 -p 30304 -m on -t 8 
