#!/bin/bash

# starts local ethereum node #1
eth -d ~/.eth-cli-1 -l 30302 -n off -j --json-rpc-port 8080 -m on -t 8 -p 30304 -r 10.0.1.16 --verbosity 11
