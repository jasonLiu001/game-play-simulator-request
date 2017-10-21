windows下运行环境配置
===============

## `MSB8036: The Windows SDK version 8.1 was not found`

原因：缺少`C++`编译环境，通过下面的方法来配置`Node.js`调用`C++`模块的运行环境

## Windows 10下为Node.js配置Native Addon环境

####第一步：安装`C++`编译环境

方法一：安装[`Visual C++ Build Tools`](http://go.microsoft.com/fwlink/?LinkId=691126)

方法二：通过安装`Visual Studio 2015`来自动获取`C++`编译环境，安装时一定要勾选`适用Visual C++ 2015 公共工具`

#### 第二步：安装Python 2.7

暂不支持v3.x.x，安装完成后，运行`npm config set python C:\Users\liuwang\.windows-build-tools\python27\python.exe`，再次打开命令行，运行`npm config set msvs_version 2015`

> 参考文档链接
>
> [https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#environment-setup-and-configuration](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#environment-setup-and-configuration)