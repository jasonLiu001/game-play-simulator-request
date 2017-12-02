import {Config, CONFIG_CONST} from "../../../config/Config";
import {ResponseData} from "../../../models/ResponseData";
import {CaptchaDecoderService} from "../../captcha/CaptchaDecoderService";
import {PlatformAbstractBase} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {ErrorService} from "../../ErrorService";

let path = require('path'),
    fs = require('fs'),
    log4js = require('log4js'),
    log = log4js.getLogger('Vbc02LoginService'),
    cheerio = require('cheerio'),
    captchaService = new CaptchaDecoderService();

/**
 *
 *
 * V博平台
 */
export class Vbc02LoginService extends PlatformAbstractBase {

    /**
     *
     *
     * 打开登录页
     */
    public gotoLoginPage(request: any): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + '/login');
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
                    url: CONFIG_CONST.siteUrl + '/resources/captcha.jpg?' + Math.random()
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
    public loginMock(request: any, capatchaCodeString: string): Promise<any> {
        //输出request调试信息
        //require('request').debug = true;
        return this.httpPost(request, CONFIG_CONST.siteUrl + '/login', {
            format: 'json',
            username: CONFIG_CONST.username,
            captcha: capatchaCodeString,
            password: CONFIG_CONST.password
        });
    }

    /**
     *
     *
     * 对外的调用接口
     */
    public login(request: any): Promise<any> {
        return this.gotoLoginPage(request)
            .then((indexContent) => {
                //请求验证码
                return this.saveCaptchaCodeImage(request);
            })
            .then(() => {
                //破解验证码
                return captchaService.decoder();
            })
            .then((parserRes: ResponseData) => {
                //开始登录
                return this.loginMock(request, parserRes.pic_str);
            }).catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}