#!/bin/bash

# starts local ethereum node #3
eth -d ~/.eth-cli-3 -l 30301 -n off -j --json-rpc-port 8082 -m on -t 8 -p 30304 -r 10.0.1.16 --verbosity 11
