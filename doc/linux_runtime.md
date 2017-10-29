Linux 下运行环境配置
=============

## CentOS 7

1. 安装`node`  参考文档：<https://nodejs.org/en/download/package-manager/>

   Run as root on RHEL, CentOS or Fedora, for Node.js v6 LTS:

   ```shell
   curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
   ```

   Then install, as root:

   ```shell
   yum -y install nodejs
   ```

   **Optional**: install build tools

   To compile and install native addons from npm you may also need to install build tools:

   ```shell
   yum install gcc-c++ make
   # or: yum groupinstall 'Development Tools'
   ```

2.  安装`electron`的`centos`依赖

   ```shell
   $ sudo yum install clang dbus-devel gtk2-devel libnotify-devel \
                      libgnome-keyring-devel xorg-x11-server-utils libcap-devel \
                      cups-devel libXtst-devel alsa-lib-devel libXrandr-devel \
                      GConf2-devel nss-devel
   ```

3.  下载源代码前安装`git`

   ```shell
   $ sudo yum install git
   ```

   ​

4.  安装`cnpm`，如果通过`npm`安装的话，`electron`在安装的时候可能安装不完成，会导致运行出错

   ```shell
    npm install -g cnpm --registry=https://registry.npm.taobao.org
   ```

   参考文档：<https://github.com/electron/electron/blob/master/docs/development/build-instructions-linux.md>

5.  调试模式，运行代码，得到下面的输出

   ```shell
   [root@worker1 game-play-simulator]# DEBUG=nightmare*,electron* node ./dist/App.js
     nightmare queuing process start +0ms
     nightmare queueing child action addition for "saveCaptchaCode" +3ms
   程序已启动，持续监视中...
     nightmare queueing action "viewport" +6ms
     nightmare queueing action "goto" for http://123.jn707.com +0ms
     nightmare queueing action "wait" +0ms
     nightmare queueing action "inject" +0ms
     nightmare running +0ms
     electron:stderr /home/liuwang/game-play-simulator/node_modules/_electron@1.6.11@electron/dist/electron: error while loading shared libraries: libXss.so.1: cannot open shared object file: No such file or directory +371ms
     nightmare electron child process exited with code 127: command not found - you may not have electron installed correctly +6ms
     nightmare electron child process not started yet, skipping kill. +1ms
   ```

   提示缺少`libXss.so.1`,通过`yum provides libXss.so.1  ` 来检查是否需要安装哪个类库

   ```shell
   [root@worker1 game-play-simulator]# yum provides libXss.so.1
   已加载插件：fastestmirror
   Loading mirror speeds from cached hostfile
    * base: mirrors.btte.net
    * extras: mirrors.btte.net
    * updates: mirrors.btte.net
   libXScrnSaver-1.2.2-6.1.el7.i686 : X.Org X11 libXss runtime library
   源    ：base
   匹配来源：
   提供    ：libXss.so.1
   ```

   提示在`libXScrnSaver-1.2.2-6.1.el7.i686`这个库中，所以安装这个

   ```shell
   yum install libXScrnSaver-1.2.2-6.1.el7  //不需要添加.i686的后缀，这样程序会自己安装对应版本
   ```

   继续运行程序，提示信息如下

   ```shell
   [root@worker1 game-play-simulator]# DEBUG=nightmare*,electron* node ./dist/App.js
     nightmare queuing process start +0ms
     nightmare queueing child action addition for "saveCaptchaCode" +3ms
   程序已启动，持续监视中...
     nightmare queueing action "viewport" +6ms
     nightmare queueing action "goto" for http://123.jn707.com +0ms
     nightmare queueing action "wait" +0ms
     nightmare queueing action "inject" +0ms
     nightmare running +1ms
     nightmare electron child process exited with code 1: general error - you may need xvfb +1s
     nightmare electron child process not started yet, skipping kill. +1ms
   ```

   提示缺少`xvfb`，好的，到这里就基本成功了，执行下面安装`X-server`和`Xvfb`的命令

6.  install `X-server` and `Xvfb` to the instance. `Xvfb`时一个X虚拟框架，这个仿真框架使用虚拟内存能让X-Server运行在没有显示设备的机器上。这样，浏览器就可以运行了，`Xvfb`可以用来运行无界面的浏览器`headless browser`

   ```shell
    sudo yum -y install xorg-x11-server-Xorg xterm   # x-server
    sudo yum -y install xorg-x11-drv-vesa xorg-x11-drv-evdev xorg-x11-drv-evdev-devel  # x-drivers
    sudo yum -y install Xvfb   
   ```

7. `xvfb`安装完成后，启动调试模式，通过`xvfb`来运行程序，输出信息如下：

   ```shell
   [root@worker1 game-play-simulator]# DEBUG=nightmare*,electron* xvfb-run -a --server-args="-screen 0 1024x768x24" node ./dist/App.js  nightmare queuing process start +0ms
     nightmare queueing child action addition for "saveCaptchaCode" +3ms
   程序已启动，持续监视中...
     nightmare queueing action "viewport" +15ms
     nightmare queueing action "goto" for http://123.jn707.com +1ms
     nightmare queueing action "wait" +0ms
     nightmare queueing action "inject" +0ms
     nightmare running +0ms
     electron:stderr Xlib:  extension "RANDR" missing on display ":99". +174ms
     electron:stderr  +807ms
     electron:stderr (electron:24101): Pango-WARNING **: failed to choose a font, expect ugly output. engine-type='PangoRenderFc', script='common' +1ms
     electron:stderr Xlib:  extension "RANDR" missing on display ":99". +51ms
     electron:stderr [24101:0616/154300.731295:FATAL:platform_font_linux.cc(63)] Check failed: typeface. Could not find any font: Sans, sans +447ms
     electron:stderr #0 0x000001cd013e <unknown> +1ms
     electron:stderr #1 0x000001cb53db <unknown> +0ms
     electron:stderr #2 0x000003b4c5bd <unknown> +0ms
     electron:stderr #3 0x000003b4c1ff <unknown> +0ms
     electron:stderr #4 0x000003b4ceb6 <unknown> +0ms
     electron:stderr #5 0x000003b59a79 <unknown> +0ms
     electron:stderr #6 0x000002c2825e <unknown> +0ms
     electron:stderr #7 0x000002afc6a3 <unknown> +1ms
     electron:stderr #8 0x000003c27c06 atom::api::WebContents::InitWithSessionAndOptions() +0ms
     electron:stderr #9 0x000003c28456 atom::api::WebContents::WebContents() +0ms
     electron:stderr #10 0x000003c32b96 atom::api::WebContents::Create() +0ms
     electron:stderr #11 0x000003c44395 atom::api::Window::Window() +0ms
     electron:stderr #12 0x000003c45eac atom::api::Window::New() +0ms
     electron:stderr #13 0x000003bed150 mate::internal::InvokeNew<>() +0ms
     electron:stderr #14 0x000003bed2e0 mate::internal::Dispatcher<>::DispatchToCallback() +1ms
     electron:stderr #15 0x7fe7616cff7f <unknown> +0ms
     electron:stderr #16 0x7fe76127a4cb <unknown> +0ms
     electron:stderr #17 0x7fe761279f89 <unknown> +0ms
     electron:stderr #18 0x1224e3f043a7 <unknown> +0ms
     electron:stderr  +0ms
     nightmare electron child process exited with code null: undefined +84ms
     nightmare electron child process not started yet, skipping kill. +1ms
   ```
   根据提示，缺少`platform_font_linux.cc`字体信息，所以执行下面安装字体的操作

   参考文档：<https://gist.github.com/dimkir/f4afde77366ff041b66d2252b45a13db>

8. 安装缺省字体

   ```shell
   yum -y install  liberation-mono-fonts  liberation-narrow-fonts liberation-sans-fonts  liberation-serif-fonts
   ```
   参考文档：<https://www.centos.org/forums/viewtopic.php?t=60908&start=10>

9. 继续通过`vxfb`来运行程序

   ```shell
    DEBUG=nightmare*,electron* xvfb-run -a --server-args="-screen 0 1024x768x24" node ./dist/App.js
   ```

   成功！程序启动成功！

