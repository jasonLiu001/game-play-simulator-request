import {Config, CONFIG_CONST} from "../../../config/Config";
import {TimeService} from "../../time/TimeService";
import {PlatformAbstractBase, IPlatformLotteryService} from "../PlatformAbstractBase";
import BlueBirdPromise = require('bluebird');
import {EnumAwardMode} from "../../../models/EnumModel";
import {ErrorService} from "../../ErrorService";
import {LotteryDbService} from "../../dbservices/ORMService";
import {InvestInfo} from "../../../models/db/InvestInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('Vbc02LotteryService');

export class Vbc02LotteryService extends PlatformAbstractBase implements IPlatformLotteryService {
    /**
     *
     * 产生V博平台投注模式 元，角，分，厘
     */
    public getInvestMode(): any {
        let mode = 'FEN';//默认为分
        log.info('当前投注单位：%s', CONFIG_CONST.awardMode);
        switch (CONFIG_CONST.awardMode) {
            case EnumAwardMode.yuan:
                mode = 'YUAN';
                break;
            case EnumAwardMode.jiao:
                mode = 'JIAO';
                break;
            case EnumAwardMode.feng:
                mode = 'FEN';
                break;
            case EnumAwardMode.li:
                mode = 'LI';
                break;
        }
        return mode;
    }

    /**
     *
     *
     * 执行后三投注操作
     */
    public investMock(request: any, token: string, currentPeriod: string, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): BlueBirdPromise<any> {
        let json = {
            betWay: 'NORMAL',
            datas: [
                {
                    betRebatePoint: 0,
                    content: touZhuHaoMa,
                    mode: this.getInvestMode(),
                    multiple: Number(touZhuBeiShu),
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
        return new BlueBirdPromise((resolve, reject) => {
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
    public invest(request: any, touZhuBeiShu: string = '1'): BlueBirdPromise<any> {
        let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
        return this.gotoLoginSuccessPage(request, '/')
            .then((body) => {
                return LotteryDbService.getInvestInfo(currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
            })
            .then((investInfo: InvestInfo) => {
                return this.investMock(request, null, currentPeriod, investInfo.investNumbers, touZhuBeiShu, investInfo.investNumbers.split(',').length);
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}
