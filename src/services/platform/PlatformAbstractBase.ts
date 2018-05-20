import Promise = require('bluebird');
import {CONFIG_CONST, Config} from "../../config/Config";

let path = require('path'),
    fs = require('fs'),
    log4js = require('log4js'),
    log = log4js.getLogger('PlatformAbstractBase');


export class PlatformAbstractBase {
    /**
     *
     *
     * 打开登录页
     */
    public gotoLoginPage(request: any, loginUrl: string): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + loginUrl);
    }

    /**
     *
     * 请求成功登录之后的页面
     */
    public gotoLoginSuccessPage(request: any, loginSuccessUrl: string): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + loginSuccessUrl);
    }


    /**
     *
     * 保存验证码图片
     * @param request
     * @param captchaCodeUrl  图片验证产生的url
     */
    public saveCaptchaCodeImage(request: any, captchaCodeUrl: string): Promise<any> {
        return new Promise((resolve, reject) => {
            request.get(
                {
                    url: CONFIG_CONST.siteUrl + captchaCodeUrl + Math.random()
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
     * Http的Get请求
     */
    public httpGet(request: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            request.get(
                {
                    url: url
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                });
        });
    }

    /**
     *
     *
     *  该方法只支持Content-Type:application/x-www-form-urlencoded 的表单提交，
     *  新的Content-Type类型，如：Content-Type:application/json 需要单独写实现方法，直接调用request原生方法来实现即可
     *  参照地址：https://github.com/request/request#requestoptions-callback
     */
    public httpFormPost(request: any, url: string, form: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            request.post(
                {
                    url: url,
                    form: form,
                    strictSSL: false
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                }
            );
        });
    }
}

/**
 *
 * 平台登录接口类
 */
export interface IPlatformLoginService {
    /**
     *
     * 开始模拟登录操作
     * @param request
     * @param captchaCodeString
     */
    loginMock(request: any, captchaCodeString: string): Promise<any>;

    /**
     *
     * 对外的调用接口
     * @param request
     */
    login(request: any): Promise<any>;

    /**
     *
     * 退出登录
     */
    loginOut(request: any): Promise<any>;
}

/**
 *
 * 平台投注接口类
 */
export interface IPlatformLotteryService {
    /**
     *
     * 产生平台投注模式 元，角，分，厘
     */
    getInvestMode(): any;

    /**
     *
     * 执行执行 后三 投注操作 目前只支持后三投注
     * @param request
     * @param token 没有则传null值
     * @param currentPeriod  投注期号
     * @param touZhuHaoMa  投注号码  逗号分隔  1,2,3,4
     * @param touZhuBeiShu 投注倍数
     * @param zhuShu 投注号码一共多少注
     */
    investMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): Promise<any>;

    /**
     *
     * 直接投注的入口方法
     * @param request
     * @param touZhuBeiShu 投注倍数
     */
    invest(request: any, touZhuBeiShu: string): Promise<any>;
}