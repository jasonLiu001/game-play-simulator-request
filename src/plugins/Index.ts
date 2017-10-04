/**
 *
 * @summary nightmare的扩展方法
 * */
let saveCaptchaCodePlugin = require('./electron/SaveCaptchaCode'),
    getLastPrizeNumberPlugin = require('./nightmare/GetLastPrizeNumber');

module.exports = {
    install: (Nightmare) => {
        //保存验证码插件
        saveCaptchaCodePlugin.install(Nightmare);
        //获取奖号插件
        getLastPrizeNumberPlugin.install(Nightmare);

        return Nightmare;
    }
};