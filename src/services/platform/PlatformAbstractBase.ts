import Promise = require('bluebird');
import {CONFIG_CONST, Config} from "../../config/Config";
import {ErrorService} from "../ErrorService";
import {InvestInfo} from "../../models/db/InvestInfo";

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
    gotoLoginPage(request: any, loginUrl: string): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + loginUrl);
    }

    /**
     *
     * 请求成功登录之后的页面
     */
    gotoLoginSuccessPage(request: any, loginSuccessUrl: string): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + loginSuccessUrl);
    }


    /**
     *
     * 保存验证码图片
     * @param request
     * @param captchaCodeUrl  图片验证产生的url
     */
    saveCaptchaCodeImage(request: any, captchaCodeUrl: string): Promise<any> {
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
    httpGet(request: any, url: string): Promise<any> {
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
    httpFormPost(request: any, url: string, form: any = {}, headers: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            request.post(
                {
                    url: url,
                    form: form,
                    headers: headers
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                }
            );
        });
    }

    /**
     *
     * 退出登录
     */
    loginOut(request: any, logoutUrl): Promise<any> {
        return this.httpFormPost(request, CONFIG_CONST.siteUrl + logoutUrl)
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
                Promise.reject(e);
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
    getInvestMode(awardMode: number): any;

    /**
     *
     * 执行执行 后三 投注操作 目前只支持后三投注
     * @param request
     * @param token 没有则传null值
     * @param currentPeriod  投注期号
     * @param awardMode 元角分模式
     * @param touZhuHaoMa  投注号码  逗号分隔  1,2,3,4
     * @param touZhuBeiShu 投注倍数
     * @param zhuShu 投注号码一共多少注
     */
    investMock(request: any, token: string, currentPeriod: string, awardMode: number, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): Promise<any>;

    /**
     *
     * 直接投注的入口方法
     * @param request
     * @param investInfo 投注记录实体
     */
    invest(request: any, investInfo: InvestInfo): Promise<any>;

    /**
     *
     * 撤单入口方案
     * @param request
     * @param cacelPeriod  撤单的期号
     */
    cancelInvest(request: any, cacelPeriod: string): Promise<any>;
}