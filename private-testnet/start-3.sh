#!/bin/bash

# starts local ethereum node #3
eth -L -d ~/.eth-cli-3 -l 30305 -n off -m on -j --json-rpc-port 8082 -r 172.20.10.4 -p 30304
