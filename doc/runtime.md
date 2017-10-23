## `grunt`编译`typescript`的环境配置
#### 安装`typescript`版本的`grunt`环境
1. 安装`npm install grunt --save-dev`
2. 安装`npm install grunt-cli --save-dev`
3. 安装`npm install grunt-ts --save-dev` //添加对`typescript`的支持
4. 安装`npm install typescript --save-dev`
5. 安装`node`的`typescript`类型声明`npm install @types/node --save-dev`;
6. 安装`npm install grunt-contrib-copy --save-dev` //用于复制.png,.jpg这样的静态文件

#### 运行`grunt`来构建当前项目
在项目的根目录下打开命令行，运行以下命令
```shell
npm run grunt  //生成项目文件
```


## 项目使用`nightmare`获取验证码图片方案
1. 创建`nightmare`实例，打开网址
2. 使用当前`nightmare`实例，再次请求验证码地址，并保存验证码图片到本地
    - [x] 通过`Nightmare`的`action`方法扩展`electron`的`Action`来实现验证码保存到本地的功能

## `Nightmare`使用技巧总结
1. `Nightmare`的每个`action`都支持`Promise`，这个是一个非常棒的特性，利用这个进行错误的处理非常方便，不需要过多的嵌套的处理，非常棒！！

2. 在`Nightmare`中除了可以使用`Promise`以外，还可以利用第三方的库，来实现`yield`链式操作，具体可[参考文档](https://github.com/rosshinkley/nightmare-examples#nightmare-and-generators)中的`vo`和`co`库的使用

3. `Nightmare`的每个实例都有独立的`queue`，所以的链式操作都在这个`queue`中，同时运行多个实例执行操作，会出现意想不到的问题，这个违背了`nightmare`的设计初衷，具体可以[参考文档说明](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md)

4. 在`Nightmare`中定义自定义方法来调用`Electron`中的方法，具体可[参考文档](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/action.md)

   ```javascript
   var Nightmare = require('nightmare');
   //这里在Nightmare上添加了一个自定义的扩展方法saveCaptchaCode，调用这个这个方法会有一个done的回调函数，这个回调函数有两个参数，第一个是error对象，第二个是result对象。调用saveCaptchaCode方法以后可以通过then方法来获取done回调中传递的参数信息。
   Nightmare.action('saveCaptchaCode',
       //define the action to run inside Electron
       function (name, options, parent, win, renderer, done) {
           parent.respondTo('downloadURL', function (done) {
               win.webContents.session.on('will-download', (event, item, webContents) => {
                   item.setSavePath('./lib/captcha/captcha.jpeg');
                   item.once('done', (event, state) => {
                       //这里的done的callback方法有两个参数，第一个为error，第二个为result
                       done(null,state);
                   });
               });
               //验证码地址
               win.webContents.downloadURL('https://123.jn707.com/verifyCode?' + Math.random());
           });
           //call the action creation `done`
           done();
       },
       function (done) {
           //使用IPC 调用Electron中对应的方法
           this.child.call('downloadURL', done);
       });

   //create a nightmare instance
   var nightmare = Nightmare();

   nightmare
     //go to a url
     .goto('http://example.com')
     //调用自定义的方法
     .saveCaptchaCode()
     .then((result) => {
       //这里的result是saveCaptchaCode中done方法中的result参数
     })
     .catch((error) => console.dir(error));//这里得到的error是saveCaptchaCode中done方法中的error参数
   ```
   > 注意：必须在`nightmare`实例被初始化之前，注册自定义的`Action`，这样的`Action`才是有效的，具体可[参考文档](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/action.md#action-must-be-called-before-instantiation)

5. 把上面的代码如何抽离到一个单独的文件，并引用？因为`nightmare`是一个`js`库，并非`typescript`中的类型，所以在抽离到单独的文件并导出时，操作上和`typescrpt`模块的`import`和`export`有区别。

   *SaveCaptchaCode.ts*文件

   ```javascript
   //使用这种import语句，是因为nightmare是js库没有export方法，所以在typescript中需要这样引入对js库的引用
   import * as Nightmare from 'nightmare';

   //扩展方法的实现，省略....
   ...
   //这里通过node模块导出的方式来导出整个模块
   module.exports = Nightmare;
   ```

   在*Automator.ts*文件中使用

   ```javascript
    let Nightmare = require('path/SaveCaptchaCode');
   ```

6. 添加扩展`nightmare`的方法是，在调用这个自定义方法之前，必须调用`goto`方法，否则一直处理等待状态。

   ```typescript
   import * as Nightmare from 'nightmare';

   Nightmare.action('getLastPrizeNumber', function (selector, done) {
       this.evaluate_now((selector) => {

           //TODO:application business logic.

       }, done, selector);
   });

   //调用自定义方法
   Nightmare()
   .goto("somewhere")  //这里的goto必须在自定义方法getLastPrizeNumber之前调用，否则不会执行自定义方法
   .getLastPrizeNumber()
   .then()
   ```

   ​

7. 如果想重复的执行某个操作，可以使用`.use()`方法。比如：在百度中搜索关键词，每次都是先输入关键词再点搜索按钮，输入关键词和点搜索按钮这两个动作可以放到`.use()`方法中执行，具体实现可以[参考文档](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/use.md)

## `nightmare`中`use`方法，没有按照`nightmare`中的`queue`顺序执行

开发中发现，`use`后面的方法比`use`里面的方法先执行完成

`nightmare`中插件注册的两种写法

1. 写法一

   ```typescript
   function test(options){
     return function(nightmare){
       nightmare.goto('')
       .....
     }
   }
   ```

   ​

#### `nightmare`中注入`jquery`环境

首先通过`npm install @types/jquery --save-dev`安装`jquery`的`typescript`类型声明，确保在`typescript`编译时，能顺利通在`nightmare`初始化的时候，通过`inject`方法注入`jquery`

```typescript
this.nightmare
                .viewport(800, 600)
                .goto(SITE_URL+'/Login')
                .inject('js', path.join(__dirname, "..", "lib/jquery/jquery-3.2.1.js"))
```

在`evaluate`方法中使用`jquery`

```typescript
nightmare.evaluate(
  (selector)=>{
        return $(selector).text();
    }, config.ele_divPrizePeriodNumber)
```

注意事项：

```typescript
//在注入jquery.min.js的时候可能会遇到问题，最好就是直接注入未压缩的jquery的
```

#### `nightmare`调用`electron`中的方法时，传递参数

通过`child.call`方法传递参数，然后在`parent.respondTo`方法中的`callback`中接收参数并处理

```javascript
var path = require('path');
var Nightmare = require('nightmare');

//define a new Nightmare action named "foo"
Nightmare.action('foo',

    // This task runs in the remote process
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('foo',
            function (args, done) { // <---- See args 
                // Do whatever with args here...
                done();
            });
        done();
    },

    // use the IPC child's `call` to call the action added to the Electron instance
    function (args, done) {
        this.child.call('foo"', args, done); // <--- Args passed in
    });

    ...

    var nightmare = Nightmare();
    nightmare
        .goto('http://www.google.com")
        .foo({ some: 'value' })
        .then(function () { nightmare.end(); }, function (error) { console.log(error); });
```

#### `eletron`中使用`sqlite3`，需要重新编译成`node-webkit`版本，`nightmare`使用的是`node`环境，不需要重新编译，直接`npm`下载`sqlite`即可

因为`node`版本的`sqlite`和`node-webkit`版本的`sqlite`不能通用，所以要把`sqlite`编译成`node-webkit`可用的版本，提供给`eletron`调用。需要执行以下步骤来编译`sqlite`

1. 全局安装`nw-gyp`：

   ```sh
   npm install nw-gyp -g
   ```

2. 通过`npm`安装`sqlite`源代码并重新编译

   ```sh
   //--target_arch 取值为ia32或者x64
   //--target 取值，参照node-webkit的最新版本 => https://github.com/rogerwang/node-webkit#downloads

   npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=x64 --target=$(NODE_WEBKIT_VERSION)
   ```

   > 参考文档：<https://www.npmjs.com/package/electron-sqlite3#building-for-node-webkit>

## ES6中的`Promise`的使用总结

1. `Promise`在调用`then`方法之后，才会真正执行具体的操作，不调用`then`则不执行，也不会返回结果


## 其他常见问题
#### 常见模块编写错误
1. 有命名空间，导出的模块请注意路径，一定要跟着命名空间，[参照文档](https://github.com/Microsoft/TypeScript/issues/3337)

   *IAutomator.ts*接口类文件
```typescript
//定义一个带有命名空间的类
export namespace UIAutomation {
    export class IAutomator {
    }
}
```
*Automator.ts*实现*IAutomator*接口类型
```typescript
//导入命名空间
import {UIAutomation} from 'path/IAutomator';

//注意：这里的命名空间路径--命名空间.类
class Automator implements UIAutomation.IAutomator {

}
```



1. 如果某个模块有命名空间，`import`语句要放到`namespaces`外面，否则不会导入模块
```typescript
//import需要放到namespace的外面
import {Foo} from 'Foo';
export namespace UIAutomation {
    export class IAutomator {
    
    }
}
```

#### Error: Module 'Foo' has no default export.

解决方法，参考[`import`](http://beginor.github.io/2016/03/20/typescript-export-and-import.html)的常见用法

1. 如果是`jquery`这种没有`export`的非`typescript`的第三方库，使用下面的方式`import`模块
```typescript
import * as fs from 'fs';
```
2. 如果模块是`typescript`语法的模块，可以用下面的`import`导入模块中的某个成员
```typescript
// foo.ts
export class Foo {
}

// 导入模块中的`Foo`模块
import {Foo} from './foo';
new Foo();
```

#### Error: 'Promise' only refers to a type, but is being used as a value here

这个是因为`typescript`配置的问题，需要添加`lib`支持，在`tsconfig.json`文件中添加`lib`支持，[参考文档](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15140)

```javascript
 lib: ["es2017", "dom"]
```

#### Cannot read property 'innerHTML' of null

出现 这个错误时，一般要检查

1. `document.getElementById`方法获取到的值是否是空`null`
2. `getElementById`方法中传递的`id`是不用带`#`的，这个和`jquery`是有区别的，一定要注意

####  Octal literals are not available when targeting ECMAScript 5 and higher

This is because use of *octal literals* was supported in ES3 and denoted by a starting `0`. Since ES5 these have been deprecated as these are ambiguous and can lead to errors. E.g.:

```javascript
var o = 0123;
console.log(o); // 83 decimal
```

Fix: change `year >= 00` to `year >= 0` as pointed out by nnnnnn

Note: ES6 is going to be better support for octal literals in the form of `0o123` : [https://github.com/lukehoban/es6features#binary-and-octal-literals](https://github.com/lukehoban/es6features#binary-and-octal-literals)

## `webkit`浏览器环境使用`sqlite3`

1. 下载并安装[python](https://www.python.org/downloads/release/python-2713/)

2. 通过`npm`安装 `nw-gyp`到全局，编译`sqlite3`时需要此环节

   ```sh
   npm install nw-gyp -g
   ```

3. 通过`npm`安装`sqlite`源代码并重新编译

   ```sh
   //--target_arch 取值为ia32或者x64
   //--target 取值，参照node-webkit的最新版本 => https://github.com/rogerwang/node-webkit#downloads

   npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=x64 --target=$(NODE_WEBKIT_VERSION)
   ```
## 软件环境依赖

1. [node.js](https://nodejs.org/zh-cn/download/)

#### 编译并运行

```shell
//安装依赖
npm install

//运行
npm start
```

#### 切换平台
只需要修改`platform`文件夹下的调用`nightmare`中方法及`config`文件即可，其他的程序逻辑不需要更改
## CentOS下运行时需要注意的几个问题

1. 需要安装`ntp`来自动同步系统时间，有可能出现时间不同步的现象`yum install ntp`，[参考文章](http://blog.51yip.com/server/1474.html)
2. 需要在xvfb下来运行程序

## 运行条件
1. 配置文件中用户名和密码必输
2. 运行前配置当前账号余额
3. 设置投注的模式，元、角、分、厘
4. 设置最大盈利金额
5. 需要获取的历史数据数量