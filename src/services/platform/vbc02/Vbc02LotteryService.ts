import {Config, CONFIG_CONST} from "../../../config/Config";
import {TimeService} from "../../time/TimeService";
import {PlatformAbstractBase, IPlatformLotteryService} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {EnumAwardMode} from "../../../models/EnumModel";
import {ErrorService} from "../../ErrorService";
let log4js = require('log4js'),
    log = log4js.getLogger('Vbc02LotteryService');

export class Vbc02LotteryService extends PlatformAbstractBase implements IPlatformLotteryService {
    /**
     *
     * 请求成功登录之后的页面
     */
    public gotoLoginSuccessPage(request: any): Promise<any> {
        return this.httpGet(request, CONFIG_CONST.siteUrl + '/');
    }

    /**
     *
     *
     * 执行投注操作
     */
    public investMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): Promise<any> {
        let json = {
            betWay: 'NORMAL',
            datas: [
                {
                    betRebatePoint: 0,
                    content: '123',
                    mode: 'FEN',
                    multiple: 1,
                    playKindId: 29,
                    playTypeId: 31,
                    position: ''
                }
            ],
            gameId: 1,
            issue: currentPeriod
        };
        //输出request调试信息
        //require('request').debug = true;
        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                uri: CONFIG_CONST.siteUrl + '/caipiao/game/bet',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify(json)
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
     * 直接投注的入口方法
     * @param request
     * @param touZhuBeiShu 投注倍数
     */
    public invest(request: any, touZhuBeiShu: string = '1'): Promise<any> {
        return this.gotoLoginSuccessPage(request)
            .then((body) => {
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                return this.investMock(request, null, currentPeriod, Config.currentInvestNumbers, touZhuBeiShu, Config.currentInvestNumbers.split(',').length);
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}