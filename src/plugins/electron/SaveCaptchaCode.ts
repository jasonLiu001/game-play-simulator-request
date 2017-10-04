/**
 *
 * @summary nightmare的扩展方法，调用electron中的对应方法
 * */
module.exports = {
    install: (Nightmare) => {
        /**
         *
         * @summary nightmare的扩展方法
         * */
        Nightmare.action('saveCaptchaCode',
            //define the action to run inside Electron
            function (name, options, parent, win, renderer, done) {
                parent.respondTo('downloadURL', function (captchaUrl, done) {
                    win.webContents.session.on('will-download', (event, item, webContents) => {
                        //setSavePath中的路径是相对于 node命令运行的目录的，比如：在c:\a 下运行node命令 ，那么根目录就是"a"目录
                        item.setSavePath('./captcha.jpeg');
                        item.once('done', (event, state) => {
                            //这里的done的callback方法有两个参数，第一个为error，第二个为result
                            done(null, state);
                        });
                    });
                    //验证码地址
                    win.webContents.downloadURL(captchaUrl);
                });
                //call the action creation `done`
                done();
            },
            function (captchaUrl, done) {
                //使用IPC 调用Electron中对应的方法
                this.child.call('downloadURL', captchaUrl, done);
            });
        return Nightmare;
    }
};