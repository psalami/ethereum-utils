#!/bin/bash

# starts local ethereum node #2
eth -L -d ~/.eth-cli-2 -l 30304 -n off -m off -j --json-rpc-port 8081 -u 127.0.0.1 -m on -t 8 
