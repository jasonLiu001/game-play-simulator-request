import {Config, CONFIG_CONST} from "../../../config/Config";
import {TimeService} from "../../time/TimeService";
import {PlatformAbstractBase, IPlatformLotteryService} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {EnumAwardMode} from "../../../models/EnumModel";
import {ErrorService} from "../../ErrorService";
import {EmailSender} from "../../email/EmailSender";

let log4js = require('log4js'),
    log = log4js.getLogger('JiangNanLotteryService');

export class JiangNanLotteryService extends PlatformAbstractBase implements IPlatformLotteryService {
    /**
     *
     * 产生平台投注模式 元，角，分，厘
     */
    public getInvestMode(): any {
        let mode = String(EnumAwardMode.feng);//默认为分模式
        switch (Config.currentSelectedAwardMode) {
            case EnumAwardMode.yuan:
                mode = String(EnumAwardMode.yuan);
                break;
            case EnumAwardMode.jiao:
                mode = String(EnumAwardMode.jiao);
                break;
            case EnumAwardMode.feng:
                mode = String(EnumAwardMode.feng);
                break;
            case EnumAwardMode.li:
                mode = String(EnumAwardMode.li);
                break;
        }
        return mode;
    }

    /**
     *
     *
     * 获取当前账号余额
     */
    public getBalance(request: any): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + '/userInfo/getBalance.mvc');
    }

    /**
     *
     * 登录成功后，获取用户信息
     */
    public getLoginUserInfo(request: any): Promise<any> {
        return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/userInfo/getUserInfo.mvc', {
            menuName: ''
        });
    }

    /**
     *
     *
     * 产生投注的token  这里没有调用公共的httpPost，调用的时候有问题，暂时还未找到解决方案
     */
    public getInvestToken(request: any): Promise<any> {
        return new Promise((resolve, reject) => {
            request.post(
                {
                    url: CONFIG_CONST.siteUrl + '/gameType/initGame.mvc',
                    form: {
                        gameID: 1
                    },
                    headers: {
                        'Referer': CONFIG_CONST.siteUrl + '/pchome'
                    }
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    try {
                        let json: any = JSON.parse(body);
                        let token = json.data.token_tz;
                        resolve(token);
                    } catch (e) {
                        if (e) {
                            log.error(e);
                            reject(e);
                        }
                    }


                }
            );
        });
    }

    /**
     *
     * 获取投注的token
     * {0} token
     * {1} issueNo 投注期号
     * {2} touZhuHaoMa  投注号码
     * {3} touZhuBeiShu 投注倍数
     * {4} danZhuJinEDanWei  单注金额单位
     * {5} zhuShu 投注号码一共多少注
     */
    private getInvestTokenString(token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): string {
        let tokenStr = "{'token':'{0}','issueNo':'{1}','gameId':'1','tingZhiZhuiHao':'true','zhuiHaoQiHao':[],'touZhuHaoMa':[{'wanFaID':'8','touZhuHaoMa':'{2}','digit':'','touZhuBeiShu':'{3}','danZhuJinEDanWei':'{4}','yongHuSuoTiaoFanDian':'0','zhuShu':'{5}','bouse':'7.7'}]}";
        log.info('当前投注单位：%s', Config.currentSelectedAwardMode);
        let mode: string = this.getInvestMode();
        tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', mode).replace('{5}', String(zhuShu));
        return tokenStr;
    }

    /**
     *
     * 获取投注的token
     * {0} token
     * {1} issueNo 投注期号
     * {2} touZhuHaoMa  投注号码  逗号分隔  1,2,3,4
     * {3} touZhuBeiShu 投注倍数
     * {4} danZhuJinEDanWei  单注金额单位
     * {5} zhuShu 投注号码一共多少注
     * {6} currentNextPeriod 追号下一期
     */
    private getMultiInvestTokenString(token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number, currentNextPeriod: string): string {
        let tokenStr = "{'token':'{0}','issueNo':'{1}','gameId':'1','tingZhiZhuiHao':'true','zhuiHaoQiHao':[{'qiHao':'{1}','beiShu':'1'},{'qiHao':'{6}','beiShu':'2'}],'touZhuHaoMa':[{'wanFaID':'41','touZhuHaoMa':'||||{2}','digit':'4','touZhuBeiShu':'{3}','danZhuJinEDanWei':'{4}','yongHuSuoTiaoFanDian':'0','zhuShu':'{5}','bouse':'7.7'}]}";
        log.info('当前投注单位：%s', Config.currentSelectedAwardMode);
        let mode: string = this.getInvestMode();
        tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', mode).replace('{5}', String(zhuShu)).replace('{6}', String(currentNextPeriod));
        return tokenStr;
    }

    /**
     *
     *
     * 执行追号投注操作
     */
    public multiInvestMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number, currentNextPeriod: string): Promise<any> {
        let investStr = this.getMultiInvestTokenString(token, currentPeriod, touZhuHaoMa, touZhuBeiShu, zhuShu, currentNextPeriod);
        return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/cathectic/cathectic.mvc', {
            json: investStr
        });
    }

    /**
     *
     *
     * 执行投注操作
     */
    public investMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): Promise<any> {
        let investStr = this.getInvestTokenString(token, currentPeriod, touZhuHaoMa, touZhuBeiShu, zhuShu);
        return this.httpFormPost(request, CONFIG_CONST.siteUrl + '/cathectic/cathectic.mvc', {
            json: investStr
        }, {
            'Referer': CONFIG_CONST.siteUrl + '/pchome'
        });
    }


    /**
     *
     * 投注准备
     * @param request
     * @return {Promise<any>} 返回token
     */
    public investPrepare(request: any): Promise<any> {
        return this.gotoLoginSuccessPage(request, '/pchome')
            .then(() => {
                return this.getLoginUserInfo(request);
            })
            .then((userInfo) => {
                //获取投注的token
                return this.getInvestToken(request);
            });
    }

    /**
     *
     * 直接投注的入口方法
     *
     * 返回数据：{"msg":"投注成功！","code":200,"data":{"MESSAGE":"投注成功！","STATUS":100,"token_tz":"3b2f1479-7bec-4369-a2e0-c7e0a4fe8bff","LIMIT":[],"BALANCE":"22.48"}}
     *
     * @param request
     * @param touZhuBeiShu 投注倍数
     */
    public invest(request: any, touZhuBeiShu: string = '1'): Promise<any> {
        return this.investPrepare(request)
            .then((token) => {
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());

                return this.investMock(request, token, currentPeriod, Config.currentInvestNumbers, touZhuBeiShu, Config.currentInvestNumbers.split(',').length);
            })
            .then((result) => {
                if (result && result.code != 200) {
                    return EmailSender.sendEmail("购买异常", result)
                        .then(() => {
                            return result;
                        });
                }

                return result;
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
                return EmailSender.sendEmail("购买异常", e.message);
            });
    }

    /**
     *
     *
     * 追号投注入口
     * @param request
     * @param touZhuBeiShu
     */
    public multiInvest(request: any, touZhuBeiShu: string = '1') {
        return this.investPrepare(request)
            .then((token) => {
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                let currentNextPeriod = TimeService.getCurrentNextPeriodNumber(new Date());

                return this.multiInvestMock(request, token, currentPeriod, Config.currentInvestNumbers, touZhuBeiShu, Config.currentInvestNumbers.split(',').length, currentNextPeriod);
            });
    }
}