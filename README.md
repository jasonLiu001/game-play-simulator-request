文档说明
========

## 程序正常运行保障特别说明
#### 必备条件1
在`Linux`下运行此程序一定要做好**时间同步**的工作，在`Linux`下设置时间自动同步
以`CentOS`为例
1. 安装ntpdate，执行以下命令
```shell
# yum install ntpdate -y  ##CentOS安装
# sudo apt-get install ntp  ##Ubuntu安装
```
2. 使用crontab计划任务定时更新网络时间
```shell
# vi /etc/crontab
```
在打开文件的末尾添加定时任务，每天早上6点执行时间同步，如下所示：
```shell
0  6  *  *  * root ntpdate ntp1.aliyun.com   ##CentOS
0  6  *  *  * ntpd ntp1.aliyun.com   ##Ubuntu
```
 其中`ntp1.aliyun.com`是阿里的时间同步服务器，也可以根据自己的需要选择其他的
#### 必备条件2
在`Linux`下设置好时间同步后，还要设置程序的自动运行时间，周一到周五运行正式程序，周六、周日两天运行模拟程序
```shell
0 2 * * 1-5 pkill -9 node
56 9 * * 1-5 pkill -9 node && sh start.sh
0 2 * * 6,0 pkill -9 node
56 9 * * 6,0 pkill -9 node && sh mock.sh
```
`CentOS`下设置定时任务可通过`crontab -e`命令来设置，设置好后会自动生效，通过`crontab -l`查看当前用户所有的定时任务

## 可选安装
#### 安装`sz/rz`下载/上传
如果当前`Linux`版本上已经支持`sz/rz`命令，则不需要重复安装，在`CentOS`下安装`sz/rz`命令
```shell
yum install lrzsz  ##CentOS
sudo apt-get install lrzsz  ##Ubuntu
```
####下载文件

```shell
sz 文件名
```

#### 上传文件

```shell
rz -ary --o-sync
```


> **补充说明**   
> sz：将选定的文件发送（send）到本地机器,即下载  
> rz：运行该命令会弹出一个文件选择窗口，从本地选择文件上传到服务器(receive),即上传，上传需要添加参数才能正常上传

## TODO

1. 添加网址检测功能，选择响应时间最小的网址
2. 多平台投注同时投注，降低风险
3. 用图表的形式展现每天的盈利状态，并保存每天的盈利截图(优先级低)
4. 写一个客户端，监视各平台的投注状况，及时停止投注等功能(优先级低)
