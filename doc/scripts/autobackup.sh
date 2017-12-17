#!/bin/bash

filepath="/root/github/game-play-simulator-request/dist"
#备份后目标文件存放目录
distpath="/root/backup"

#需要备份的文件
file=${filepath}/data.db
#需要备份的日志文件
logfile=${filepath}/log.log
#备份后的文件名称
backupfile=$(date +%Y%m%d%H%M)

#当文件大小超过60M时，执行自动备份并删除旧文件
maxfilesize=60000000
actualsize=$(wc -c <"$file")
if [ $actualsize -ge $maxfilesize ]; then
   cp $file ${distpath}/${backupfile}.db;
   rm -rf $file;
   cp $logfile ${distpath}/${backupfile}.log; 
   rm -rf $logfile;
fi
