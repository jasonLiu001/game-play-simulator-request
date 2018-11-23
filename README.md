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

#### ~~必备条件2【已废除，不再需要该定时任务，已在程序自身实现】~~
~~在`Linux`下设置好时间同步后，还要设置程序的自动运行时间，周一到周五运行正式程序，周六、周日两天运行模拟程序~~
```shell
0 2 * * 1-5 killall node
56 9 * * 1-5 sh ~/start.sh
0 2 * * 6,0 killall node
56 9 * * 6,0 sh ~/mock.sh
```
`CentOS`下设置定时任务可通过`crontab -e`命令来设置，设置好后会自动生效，通过`crontab -l`查看当前用户所有的定时任务

## 可选安装
#### 安装`sz/rz`下载/上传
如果当前`Linux`版本上已经支持`sz/rz`命令，则不需要重复安装，在`CentOS`下安装`sz/rz`命令
```shell
yum install lrzsz  ##CentOS
sudo apt-get install lrzsz  ##Ubuntu
```
#### 下载文件

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

## 在Linux服务器运行某个js的单元测试任务
```shell
# 切换到RequestLoginService.Spec.js文件所在目录 运行以下命令
node /root/github/game-play-simulator-request/node_modules/jasmine/bin/jasmine.js RequestLoginService.Spec.js
```

## ts编译生成js的最终路径设置
- 需要在`tsconfig.json`中的`outDir`属性指定输出路径
- 因为`typescript`编译器不会自动拷贝非`ts`文件到输出路径，所以需要借助第三方工具，本项目中使用的是`grunt-ts`中的`copy`功能，所以在`Gruntfile.js`中的`copy`节点中的`dest`属性注意要和`tsconfig.json`中的`outDir`目录保持一致，才能正确的拷贝文件到对应的目录下

## web站点开发时如何解决调用tomcat服务接口，提示跨域问题？
- 默认nginx端口为80，自己电脑上可以有iis已经占有了80，修改成其他端口即可，修改server节点的listen对应的端口值；
- 本地开发需要在本地安装nginx，和服务器上的nginx配置保持一致即可（端口可能不太一样，这个要注意）；
