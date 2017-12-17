#!/bin/bash
# Program name: check.sh
date
cat /root/vb.list
cat /root/vb.list |  while read output
do
    ping -c 2 "$output"
done
