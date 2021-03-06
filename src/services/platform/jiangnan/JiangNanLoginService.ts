import {CONFIG_CONST} from "../../../config/Config";
import {ResponseData} from "../../../models/ResponseData";
import {CaptchaDecoderService} from "../../captcha/CaptchaDecoderService";
import {IPlatformLoginService, PlatformAbstractBase} from "../PlatformAbstractBase";
import {ErrorService} from "../../ErrorService";
import {NotificationSender} from "../../notification/NotificationSender";
import {EnumNotificationType, EnumSMSSignType, EnumSMSTemplateType} from "../../../models/EnumModel";
import {SMSSender} from "../../notification/sender/SMSSender";
import Promise = require('bluebird');
import moment  = require('moment');

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
export class JiangNanLoginService extends PlatformAbstractBase implements IPlatformLoginService {
    /**
     *
     *
     * 开始模拟登录操作
     */
    loginMock(request: any, captchaCodeString: string): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + "/login/need-validate-code.mvc")
            .then(() => {
                return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/login/safe.mvc?');
            })
            .then(() => {
                return this.httpFormPost(request, CONFIG_CONST.siteUrl + "/Uploadimg/list.mvc");
            })
            .then(() => {
                return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/login/login.mvc?', {
                    username: CONFIG_CONST.username,
                    validate: captchaCodeString,
                    password: CONFIG_CONST.password,
                    _BrowserInfo: 'Chrome/64.0.3282.167'
                }, {
                    'Referer': CONFIG_CONST.siteUrl + '/pc'
                });
            });
    }

    /**
     *
     *
     * 对外的调用接口
     *
     * 返回数据：{"msg":"","code":200,"data":null}
     */
    login(request: any): Promise<any> {
        return this.gotoLoginPage(request, '/pc')
            .then((indexContent) => {
                //请求验证码
                //return this.saveCaptchaCodeImage(request, '/verifyCode?');
            })
            .then(() => {
                //破解验证码
                //return captchaService.decoder();
                return null;
            })
            .then((parserRes: ResponseData) => {
                //开始登录 带验证码
                //return this.loginMock(request, parserRes.pic_str);
                return this.loginMock(request, '');
            })
            .then((result) => {
                //判断登录接口返回值，如果不是登录成功状态发送邮件通知
                if (result) {
                    let jsonResult: any;
                    let jsonParseError: boolean = false;
                    try {
                        jsonResult = JSON.parse(result);
                    } catch (e) {
                        jsonParseError = true;
                    }

                    if (jsonResult.code != 200 || jsonParseError) {
                        return SMSSender.send("登录异常", moment().format('HH:mm:ss'), String(CONFIG_CONST.currentSelectedInvestPlanType), EnumSMSSignType.cnlands, EnumSMSTemplateType.LOGIN_EXCEPTION)
                            .then(() => {
                                NotificationSender.send("登录异常", result, EnumNotificationType.PUSH_AND_EMAIL)
                            })
                            .then(() => {
                                return result;//这里必须有返回值，不能直接用sendEmail方法的返回值，因为后续有判断
                            });
                    }
                } else {
                    return SMSSender.send("登录异常", moment().format('HH:mm:ss'), String(CONFIG_CONST.currentSelectedInvestPlanType), EnumSMSSignType.cnlands, EnumSMSTemplateType.LOGIN_EXCEPTION)
                        .then(() => {
                            return NotificationSender.send("登录异常", result, EnumNotificationType.PUSH_AND_EMAIL)
                        })
                        .then(() => {
                            return result;//这里必须有返回值，不能直接用sendEmail方法的返回值，因为后续有判断
                        });
                }
                return result;
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
                return SMSSender.send("登录异常", moment().format('HH:mm:ss'), String(CONFIG_CONST.currentSelectedInvestPlanType), EnumSMSSignType.cnlands, EnumSMSTemplateType.LOGIN_EXCEPTION)
                    .then(() => {
                        return NotificationSender.send("登录异常", e.message, EnumNotificationType.PUSH_AND_EMAIL);
                    });
            });
    }
}
