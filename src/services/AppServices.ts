import Promise = require('bluebird');
import {InvestService} from "./invest/InvestService";
import {ErrorService} from "./ErrorService";
import {CONFIG_CONST, Config} from "../config/Config";
import {HttpRequestHeaders} from "../models/EnumModel";
import {LotteryDbService} from "./dbservices/ORMService";
import {AwardService} from "./award/AwardService";
import {SettingsInfo} from "../models/db/SettingsInfo";

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
     * 初始化设置
     */
    public static initSettings(settingInfoList: Array<SettingsInfo>): void {
        for (let index in settingInfoList) {
            let item = settingInfoList[index];
            if (item.key === 'originAccountBalance') {
                CONFIG_CONST.originAccountBalance = Number(item.value);
            } else if (item.key === 'maxAccountBalance') {
                CONFIG_CONST.maxAccountBalance = Number(item.value);
            } else if (item.key === 'minAccountBalance') {
                CONFIG_CONST.minAccountBalance = Number(item.value);
            } else if (item.key === 'awardMode') {
                Config.currentSelectedAwardMode = Number(item.value);
                CONFIG_CONST.awardMode = Number(item.value);
            } else if (item.key === 'touZhuBeiShu') {
                CONFIG_CONST.touZhuBeiShu = item.value;
            } else if (item.key === 'currentSelectedInvestPlanType') {
                CONFIG_CONST.currentSelectedInvestPlanType = Number(item.value);
            } else if (item.key === 'isRealInvest') {
                CONFIG_CONST.isRealInvest = Number(item.value);
            }
        }
    }

    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     */
    public static start(): void {
        log.info('程序已启动，持续监视中...');
        LotteryDbService.createLotteryTable()
            .then(() => {
                //启动获取奖号任务 间隔特定时间获取号码 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    //投注前获取投注
                    LotteryDbService.getSettingsInfoList()
                        .then((settingInfoList: Array<SettingsInfo>) => {
                            AppServices.initSettings(settingInfoList);
                            investService.executeAutoInvest(request, CONFIG_CONST.isRealInvest === 1);//执行投注
                        });
                });
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }
}
