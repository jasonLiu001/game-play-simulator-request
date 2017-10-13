import Promise = require('bluebird');
import {InvestService} from "./invest/InvestService";
import {ErrorService} from "./error/ErrorService";
import {CONFIG_CONST, Config} from "../config/Config";
import {HttpRequestHeaders} from "../models/EnumModel";
import {LotteryDbService} from "./dbservices/DBSerivice";
import {AwardService} from "./award/AwardService";
import {MockInvestService} from "./invest/MockInvestService";
let Request = require('request'), path = require('path');

let log4js = require('log4js');
log4js.configure(path.resolve(__dirname, '..', 'config/log4js.json'));

let log = log4js.getLogger('AppServices'),
    investService = new InvestService(),
    mockInvestService = new MockInvestService(),
    errorService = new ErrorService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: CONFIG_CONST.autoCheckTimerInterval,
            headers: HttpRequestHeaders
        });


/**
 *
 * App主服务入口
 */
export class AppServices {
    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     * @param {Boolean} isRealInvest 是否是真实投注，false:模拟投注 true:真实投注
     */
    public static start(isRealInvest: boolean = true): void {
        log.info('程序已启动，持续监视中...');
        LotteryDbService.createLotteryTable()
            .then(() => {
                //启动获取奖号任务 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    if (isRealInvest) {
                        investService.executeAutoInvest(request);//真实投注
                    } else {
                        mockInvestService.executeAutoInvest(null);//模拟投注
                    }
                });
            })
            .catch((err) => {
                errorService.appErrorHandler(log, err);
            });
    }

    /**
     *
     *
     * 停止获取奖号
     */
    public static stop(): void {
        clearInterval(Config.awardTimer);
    }
}
