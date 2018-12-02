import {CONFIG_CONST} from "../../../config/Config";
import {PlatformAbstractBase, IPlatformLotteryService} from "../PlatformAbstractBase";
import BlueBirdPromise = require('bluebird');
import {EnumAwardMode} from "../../../models/EnumModel";
import {ErrorService} from "../../ErrorService";
import {InvestInfo} from "../../../models/db/InvestInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('Vbc02LotteryService');

export class Vbc02LotteryService extends PlatformAbstractBase implements IPlatformLotteryService {
    /**
     *
     * 产生V博平台投注模式 元，角，分，厘
     */
    public getInvestMode(awardMode: number): any {
        let mode = 'FEN';//默认为分
        log.info('当前投注单位：%s', awardMode);
        switch (awardMode) {
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
    public investMock(request: any, token: string, currentPeriod: string, awardMode: number, touZhuHaoMa: string, touZhuBeiShu: string, zhuShu: number): BlueBirdPromise<any> {
        let json = {
            betWay: 'NORMAL',
            datas: [
                {
                    betRebatePoint: 0,
                    content: touZhuHaoMa,
                    mode: this.getInvestMode(awardMode),
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
     * @param investInfo 投注记录实体
     */
    public invest(request: any, investInfo: InvestInfo): BlueBirdPromise<any> {
        return this.gotoLoginSuccessPage(request, '/')
            .then((investInfo: InvestInfo) => {
                return this.investMock(request, null, investInfo.period, investInfo.awardMode, investInfo.investNumbers, String(investInfo.touZhuBeiShu), investInfo.investNumbers.split(',').length);
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }

    /**
     *
     * 撤单
     * @param request
     * @param cancelPeriod 撤单期号
     */
    cancelInvest(request: any, cancelPeriod: string): BlueBirdPromise<any> {
        return undefined;
    }
}
