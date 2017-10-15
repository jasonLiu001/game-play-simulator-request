文档说明
========

## 特别说明
在`Linux`下运行此程序一定要做好**时间同步**的工作，在`Linux`下设置时间自动同步
以`CentOS`为例
1. 安装ntpdate，执行以下命令
```shell
# yum install ntpdate -y
```
2. 使用crontab计划任务定时更新网络时间
```shell
# vi /etc/crontab
```
在打开文件的末尾添加定时任务，每天早上6点执行时间同步，如下所示：
```shell
0  6  *  *  * root ntpdate ntp1.aliyun.com
```
 其中`ntp1.aliyun.com`是阿里的时间同步服务器，也可以根据自己的需要选择其他的


## TODO

1. 详细列出每个计划的对错详情
2. 用图表的形式展现每天的盈利状态，并保存每天的盈利截图(优先级低)
3. 每个杀号方法中添加log输出

