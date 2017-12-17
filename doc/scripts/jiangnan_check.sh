#!/bin/bash
# Program name: check.sh
date
cat /root/jiangnan.list |  while read output
do
    ping -c 2 "$output"
done
