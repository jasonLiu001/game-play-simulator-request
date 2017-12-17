#!/bin/bash
# shell脚本中查询sqlite的第一种方式
#sqlite3 /root/github/game-play-simulator-request/dist/data.db 'select i.period,i.investNumberCount,i.currentAccountBalance,i.winMoney,i.status,i.isWin,i.investTime from invest i where i.investTime>date('now','start of day','-1 days') order by i.period asc'

# shell脚本中查询sqlite的第二种方式
plantype=$1
if [ $# -eq 0 ]; then 
	echo "缺少查询的方案类型参数";
	exit 1;
fi
echo "当前查询的方案[${plantype}]结果如下"

sqlite3 /root/github/game-play-simulator-request/dist/data.db << EOF
.mode column
select i.period,i.investNumberCount,i.currentAccountBalance,i.winMoney,i.status,i.isWin,i.investTime from invest i where i.planType=${plantype} and i.investTime>date('now','start of day','-1 days') order by i.period asc;
EOF
echo "方案[${plantype}]的查询结果显示完成"
