import Promise = require('bluebird');
import {InvestService} from "./invest/InvestService";
import {ErrorService} from "./ErrorService";
import {CONFIG_CONST, Config} from "../config/Config";
import {HttpRequestHeaders} from "../models/EnumModel";
import {LotteryDbService} from "./dbservices/DBSerivice";
import {AwardService} from "./award/AwardService";
let Request = require('request'), path = require('path');

let log4js = require('log4js');
log4js.configure(path.resolve(__dirname, '..', 'config/log4js.json'));

let log = log4js.getLogger('AppServices'),
    investService = new InvestService(),
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
                //是否有模拟投注，有则先结束模拟投注
                AppServices.clearAwardTimer();
                //启动获取奖号任务 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    investService.executeAutoInvest(request, isRealInvest);//执行投注
                });
            })
            .catch((err) => {
                ErrorService.appErrorHandler(log, err);
            });
    }

    /**
     *
     *
     * 停止获取奖号
     */
    public static clearAwardTimer(): void {
        if (Config.awardTimer) clearInterval(Config.awardTimer);
    }

    /**
     *
     * 执行模拟投注
     */
    public static startMockTask(): void {
        log.info('切换正式投注到模拟投注...');
        AppServices.clearAwardTimer();//停止真实投注程序
        AppServices.start(false);//启动模拟投注程序
        log.info('模拟投注切换完成！');
    }
}
