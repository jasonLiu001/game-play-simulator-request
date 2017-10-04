import {Config, SITE_URL} from "../../../config/Config";
import {TimerService} from "../../timer/TimerService";
import {PlatformAbstractBase} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {LotteryDbService} from "../../dbservices/DBSerivice";
let log4js = require('log4js'),
    log = log4js.getLogger('RequestLoginService'),
    timerService = new TimerService();

export class RequestPlatformService extends PlatformAbstractBase {
    /**
     *
     * 请求成功登录之后的页面
     */
    public gotoLoginSuccessPage(request: any): Promise<any> {
        return this.httpGet(request, SITE_URL + '/Index');
    }

    /**
     *
     *
     * 获取当前账号余额
     */
    public getBalance(request: any): Promise<any> {
        return this.httpGet(request, SITE_URL + '/userInfo/getBalance.mvc');
    }

    /**
     *
     * 登录成功后，获取用户信息
     */
    public getLoginUserInfo(request: any): Promise<any> {
        return this.httpPost(request, SITE_URL + '/userInfo/getUserInfo.mvc', {
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
                    url: SITE_URL + '/gameType/initGame.mvc',
                    form: {
                        gameID: 1
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
        switch (Config.currentSelectedAwardMode) {
            case Config.awardModel.yuan:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.yuan)).replace('{5}', String(zhuShu));
                break;
            case Config.awardModel.jiao:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.jiao)).replace('{5}', String(zhuShu));
                break;
            case Config.awardModel.feng:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.feng)).replace('{5}', String(zhuShu));
                break;
            case Config.awardModel.li:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.li)).replace('{5}', String(zhuShu));
                break;
        }
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
        switch (Config.currentSelectedAwardMode) {
            case Config.awardModel.yuan:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.yuan)).replace('{5}', String(zhuShu)).replace('{6}', String(currentNextPeriod));
                break;
            case Config.awardModel.jiao:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.jiao)).replace('{5}', String(zhuShu)).replace('{6}', String(currentNextPeriod));
                break;
            case Config.awardModel.feng:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.feng)).replace('{5}', String(zhuShu)).replace('{6}', String(currentNextPeriod));
                break;
            case Config.awardModel.li:
                tokenStr = tokenStr.replace('{0}', token).replace('{1}', currentPeriod).replace('{1}', currentPeriod).replace('{2}', touZhuHaoMa).replace('{3}', touZhuBeiShu).replace('{4}', String(Config.awardModel.li)).replace('{5}', String(zhuShu)).replace('{6}', String(currentNextPeriod));
                break;
        }
        return tokenStr;
    }

    /**
     *
     *
     * 执行追号投注操作
     */
    public multiInvestMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number, currentNextPeriod: string): Promise<any> {
        let investStr = this.getMultiInvestTokenString(token, currentPeriod, touZhuHaoMa, touZhuBeiShu, zhuShu, currentNextPeriod);
        return this.httpPost(request, SITE_URL + '/cathectic/cathectic.mvc', {
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
        return this.httpPost(request, SITE_URL + '/cathectic/cathectic.mvc', {
            json: investStr
        });
    }


    /**
     *
     * 投注准备
     * @param request
     * @return {Promise<any>} 返回token
     */
    public investPrepare(request: any): Promise<any> {
        return this.gotoLoginSuccessPage(request)
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
     * @param request
     * @param config
     * @param lotteryDbService
     * @param touZhuBeiShu 投注倍数
     */
    public invest(request: any, config: Config, lotteryDbService: LotteryDbService, touZhuBeiShu: string = '1'): Promise<any> {
        return this.investPrepare(request)
            .then((token) => {
                let currentPeriod = timerService.getCurrentPeriodNumber(new Date());

                return this.investMock(request, token, currentPeriod, Config.currentInvestNumbers, touZhuBeiShu, Config.currentInvestNumbers.split(',').length);
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
                let currentPeriod = timerService.getCurrentPeriodNumber(new Date());
                let currentNextPeriod = timerService.getCurrentNextPeriodNumber(new Date());

                return this.multiInvestMock(request, token, currentPeriod, Config.currentInvestNumbers, touZhuBeiShu, Config.currentInvestNumbers.split(',').length, currentNextPeriod);
            });
    }
}