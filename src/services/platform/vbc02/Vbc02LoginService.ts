import {Config, CONFIG_CONST} from "../../../config/Config";
import {ResponseData} from "../../../models/ResponseData";
import {CaptchaDecoderService} from "../../captcha/CaptchaDecoderService";
import {PlatformAbstractBase, IPlatformLoginService} from "../PlatformAbstractBase";
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
export class Vbc02LoginService extends PlatformAbstractBase implements IPlatformLoginService {
    /**
     *
     *
     * 开始模拟登录操作
     */
    public loginMock(request: any, captchaCodeString: string): Promise<any> {
        //输出request调试信息
        //require('request').debug = true;
        return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/login', {
            format: 'json',
            username: CONFIG_CONST.username,
            captcha: captchaCodeString,
            password: CONFIG_CONST.password
        });
    }

    /**
     *
     *
     * 对外的调用接口
     */
    public login(request: any): Promise<any> {
        return this.gotoLoginPage(request,'/login')
            .then((indexContent) => {
                //请求验证码
                return this.saveCaptchaCodeImage(request, '/resources/captcha.jpg?');
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