import {Config, CONFIG_CONST} from "../../../config/Config";
import {ResponseData} from "../../../models/ResponseData";
import {CaptchaDecoderService} from "../../captcha/CaptchaDecoderService";
import {PlatformAbstractBase} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {ErrorService} from "../../ErrorService";

let path = require('path'),
    fs = require('fs'),
    log4js = require('log4js'),
    log = log4js.getLogger('JiangNanLoginService'),
    cheerio = require('cheerio'),
    captchaService = new CaptchaDecoderService();

/**
 *
 * 江南娱乐平台
 * 平台登录服务 使用request模拟登陆请求
 */
export class JiangNanLoginService extends PlatformAbstractBase {

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
     * 开始模拟登录操作
     */
    public loginMock(request: any, capatchaCodeString: string): Promise<any> {
        return this.httpPost(request, CONFIG_CONST.siteUrl + '/login/safe.mvc?null')
            .then(() => {
                return this.httpPost(request, CONFIG_CONST.siteUrl + '/login/login.mvc', {
                    username: CONFIG_CONST.username,
                    validate: capatchaCodeString,
                    password: CONFIG_CONST.password,
                    _BrowserInfo: 'chrome/53.0.2785.104'
                });
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
                return this.saveCaptchaCodeImage(request, '/verifyCode?');
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