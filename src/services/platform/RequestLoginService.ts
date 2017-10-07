import {Config, CONFIG_CONST} from "../../config/Config";
import {ResponseData} from "../../models/ResponseData";
import {CaptchaDecoderService} from "../captcha/CaptchaDecoderService";
import {PlatformAbstractBase} from "./PlatformAbstractBase";
import Promise = require('bluebird');

let path = require('path'),
    fs = require('fs'),
    log4js = require('log4js'),
    log = log4js.getLogger('RequestLoginService'),
    cheerio = require('cheerio'),
    captchaService = new CaptchaDecoderService();

/**
 *
 *
 * 平台登录服务 使用request模拟登陆请求
 */
export class RequestLoginService extends PlatformAbstractBase {

    /**
     *
     *
     * 打开登录页
     */
    public gotoLoginPage(request: any): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + '/Login');
    }

    /**
     *
     *
     * 保存验证码图片
     */
    public saveCaptchaCodeImage(request: any): Promise<any> {
        return new Promise((resolve, reject) => {
            request.get(
                {
                    url: CONFIG_CONST.siteUrl + '/verifyCode?' + Math.random()
                })
                .on('error', (error) => {
                    log.error(error);
                    reject(error);
                })
                .pipe(fs.createWriteStream(Config.captchaImgSavePath)
                    .on('close', () => {
                        resolve(true);
                    }));
        });
    }

    /**
     *
     *
     * 开始模拟登录操作
     */
    public loginMock(request: any, config: Config, capatchaCodeString: string): Promise<any> {
        return this.httpPost(request, CONFIG_CONST.siteUrl + '/login/safe.mvc?null')
            .then(() => {
                return this.httpPost(request, CONFIG_CONST.siteUrl + '/login/login.mvc', {
                    username: config.captchaDecorder.user,
                    validate: capatchaCodeString,
                    password: config.captchaDecorder.pass,
                    _BrowserInfo: 'chrome/53.0.2785.104'
                });
            });
    }

    /**
     *
     *
     * 对外的调用接口
     */
    public login(request: any, config: Config): Promise<any> {
        return this.gotoLoginPage(request)
            .then((indexContent) => {
                //请求验证码
                return this.saveCaptchaCodeImage(request);
            })
            .then(() => {
                //破解验证码
                return captchaService.decoder(config);
            })
            .then((parserRes: ResponseData) => {
                //开始登录
                return this.loginMock(request, config, parserRes.pic_str);
            });
    }
}