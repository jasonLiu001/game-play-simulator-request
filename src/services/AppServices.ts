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
                CONFIG_CONST.awardMode = Number(item.value);
            } else if (item.key === 'touZhuBeiShu') {
                CONFIG_CONST.touZhuBeiShu = item.value;
            } else if (item.key === 'currentSelectedInvestPlanType') {
                CONFIG_CONST.currentSelectedInvestPlanType = Number(item.value);
            } else if (item.key === 'historyCount') {
                CONFIG_CONST.historyCount = Number(item.value);
            } else if (item.key === 'isRealInvest') {
                CONFIG_CONST.isRealInvest = Number(item.value);
            }
        }
    }

    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     * @param {Boolean} isRealInvest 是否是真实投注 true:真实投注  false:模拟投注
     */
    public static start(isRealInvest: boolean): void {
        log.info('%s程序已启动，持续监视中...', (isRealInvest ? '' : '模拟'));
        LotteryDbService.createLotteryTable()
            .then(() => {
                //是否有模拟投注，有则先结束模拟投注
                AppServices.clearAwardTimer();
                //启动获取奖号任务 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    //投注前获取投注
                    LotteryDbService.getSettingsInfoList()
                        .then((settingInfoList: Array<SettingsInfo>) => {
                            AppServices.initSettings(settingInfoList);
                            investService.executeAutoInvest(request, isRealInvest);//执行投注
                        });
                });
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
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
        log.info('模拟投注启动中...');
        AppServices.clearAwardTimer();//停止真实投注程序
        AppServices.start(false);//启动模拟投注程序
    }
}
