#!/bin/bash

# starts local ethereum node #2
eth -d ~/.eth-cli-2 -l 30304 -n off -j --json-rpc-port 8081 -m on -t 8 --verbosity 10
