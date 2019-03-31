import BlueBirdPromise = require('bluebird');
import {InvestService} from "./invest/InvestService";
import {ErrorService} from "./ErrorService";
import {Config, CONFIG_CONST} from "../config/Config";
import {LotteryDbService} from "./dbservices/ORMService";
import {AwardService} from "./award/AwardService";
import {SettingsInfo} from "../models/db/SettingsInfo";
import {SettingService} from "./settings/SettingService";
import {AppSettings} from "../config/AppSettings";
import {GlobalRequest} from "../global/GlobalRequest";
import {NotificationService} from "./notification/NotificationService";
import {ScheduleTaskList} from "../config/ScheduleTaskList";
import {JiangNanLoginService} from "./platform/jiangnan/JiangNanLoginService";

let log4js = require('log4js'),
    log = log4js.getLogger('AppServices'),
    investService = new InvestService(),
    notificationService = new NotificationService(),
    jiangNanLoginService = new JiangNanLoginService();

/**
 *
 * App主服务入口
 */
export class AppServices {
    /**
     *
     * 启动App服务 投注服务 通知服务
     */
    static startAppServices() {
        if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule == null) {
            //启动投注程序
            AppServices.start();
            //分分彩 启动时登录
            jiangNanLoginService.login(GlobalRequest.request);
        } else {
            log.error("主程序已启动，无需重复启动！");
        }
        if (ScheduleTaskList.notificationTaskEntity.cronSchedule == null) {
            //启动通知程序
            notificationService.start();
        } else {
            log.error("通知程序已启动，无需重复启动！");
        }
    }

    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     */
    static async start(): BlueBirdPromise<any> {
        log.info('主程序已启动，持续监视中...');
        return LotteryDbService.createLotteryTable()
            .then(() => {
                //程序启动时 必须首先要获取的参数配置信息 originAccountBalance,currentAccountBalance,currentSelectedAwardMode
                return SettingService.getAndInitSettings()
                    .then((settingInfoList: Array<SettingsInfo>) => {
                        for (let index in settingInfoList) {
                            let item = settingInfoList[index];
                            if (item.key === 'originAccountBalance') {
                                //这里不需要 每次都设置初始余额 只在程序启动时赋值一次即可
                                CONFIG_CONST.originAccountBalance = Number(item.value);
                            } else if (item.key === 'enableRealInvestWhenProgramStart') {
                                //这里不需要 每次都设置启动自动切换到自动投注 只在程序启动时赋值一次即可
                                AppSettings.enableRealInvestWhenProgramStart = Number(item.value) === 1;
                            }
                        }
                    });
            })
            .then(() => {
                if (AppSettings.enableRealInvestWhenProgramStart) {//程序启动时 开启真实投注
                    //切换到真实投注
                    return SettingService.switchToRealInvest();

                }
            })
            .then(() => {
                //启动获取奖号任务 间隔特定时间获取号码 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    //投注前 首先获取参数配置信息
                    SettingService.getAndInitSettings()
                        .then(() => {
                            //判断是否当前 是否处于倍投模式  模拟投注+正向投注+倍投award不为0+倍投倍数不为0
                            AppSettings.runtime_IsInDoubleInvestMode = AppSettings.doubleInvest_AwardMode != '0' && AppSettings.doubleInvest_TouZhuBeiShu != '0' && !CONFIG_CONST.isRealInvest && !AppSettings.isUseReverseInvestNumbers;
                        })
                        .then(() => {
                            return investService.executeAutoInvest(GlobalRequest.request);//执行投注
                        });
                });
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }

    /**
     *
     * 初始化app启动时各项配置
     */
    static initAppStartConfig(): void {
        Config.isInvestTotalTableInitCompleted = true;
        Config.isInvestTableInitCompleted = true;
        Config.currentInvestTotalCount = 0;
        Config.globalVariable.last_Period = null;
        Config.globalVariable.last_PrizeNumber = null;
        Config.globalVariable.nextPeriodInvestTime = null;
        Config.globalVariable.current_Peroid = null;
        Config.investPlan.one.investNumbers = '';
        Config.investPlan.two.investNumbers = '';
        Config.investPlan.three.investNumbers = '';
        Config.investPlan.four.investNumbers = '';
    }
}
