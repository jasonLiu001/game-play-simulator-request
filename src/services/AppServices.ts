import BlueBirdPromise = require('bluebird');
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
                //这里不需要 每次都设置初始余额 只在程序启动时赋值一次即可
                //CONFIG_CONST.originAccountBalance = Number(item.value);
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
                CONFIG_CONST.isRealInvest = Number(item.value) === 1;
            }
        }
    }

    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     */
    public static async start(): BlueBirdPromise<any> {
        log.info('程序已启动，持续监视中...');
        LotteryDbService.createLotteryTable()
            .then(() => {
                //程序启动时 必须首先要获取的参数配置信息 originAccountBalance,currentAccountBalance,currentSelectedAwardMode
                return AppServices.getAndInitSettings()
                    .then((settingInfoList: Array<SettingsInfo>) => {
                        for (let index in settingInfoList) {
                            let item = settingInfoList[index];
                            if (item.key === 'originAccountBalance') {
                                Config.currentAccountBalance = Number(item.value);

                                let planType: number = 1;
                                for (let key in Config.investPlan) {
                                    if (CONFIG_CONST.currentSelectedInvestPlanType == planType) {
                                        Config.investPlan[key].accountBalance = Number(item.value);
                                    }
                                    planType++;
                                }
                            } else if (item.key === 'awardMode') {
                                Config.currentSelectedAwardMode = Number(item.value);
                            } else if (item.key === 'originAccountBalance') {
                                //这里不需要 每次都设置初始余额 只在程序启动时赋值一次即可
                                CONFIG_CONST.originAccountBalance = Number(item.value);
                            }
                        }
                    });
            })
            .then(() => {
                //启动获取奖号任务 间隔特定时间获取号码 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    //投注前 首先获取参数配置信息
                    AppServices.getAndInitSettings()
                        .then(() => {
                            return investService.executeAutoInvest(request);//执行投注
                        });
                });
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }

    /**
     *
     * 从数据库中获取配置并初始化
     */
    public static getAndInitSettings(): BlueBirdPromise<any> {
        return LotteryDbService.getSettingsInfoList()
            .then((settingInfoList: Array<SettingsInfo>) => {
                AppServices.initSettings(settingInfoList);
                return settingInfoList;
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }
}
