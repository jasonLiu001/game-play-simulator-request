#!/bin/bash
cd /root/github/game-play-simulator-request
rm -rf nohup.out
rm -rf npm-debug.log
nohup npm run linux:mock &
