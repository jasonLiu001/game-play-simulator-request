import {ErrorService} from "../ErrorService";
import {LotteryDbService} from "../dbservices/ORMService";
import {SettingsInfo, update_isRealInvest_to_mock, update_isRealInvest_to_real} from "../../models/db/SettingsInfo";
import BlueBirdPromise = require('bluebird');
import {AppSettings} from "../../config/AppSettings";
import {Config, CONFIG_CONST} from "../../config/Config";

let log4js = require('log4js'),
    log = log4js.getLogger('SettingService');

/**
 *
 * 读取设置服务
 */
export class SettingService {
    /**
     *
     * 初始化设置
     */
    public static initSettings(settingInfoList: Array<SettingsInfo>): void {
        for (let index in settingInfoList) {
            let item = settingInfoList[index];
            if (item.key === 'originAccountBalance') {
                //这里不需要 每次都设置初始余额 只在程序启动时赋值一次即可
            } else if (item.key === 'enableRealInvestWhenProgramStart') {
                //这里不需要 每次都设置启动自动切换到自动投注 只在程序启动时赋值一次即可
            }
            else if (item.key === 'maxAccountBalance') {
                CONFIG_CONST.maxAccountBalance = Number(item.value);
            } else if (item.key === 'minAccountBalance') {
                CONFIG_CONST.minAccountBalance = Number(item.value);
            } else if (item.key === 'awardMode') {
                CONFIG_CONST.awardMode = Number(item.value);
            } else if (item.key === 'touZhuBeiShu') {
                CONFIG_CONST.touZhuBeiShu = item.value;
            } else if (item.key === 'currentSelectedInvestPlanType') {
                CONFIG_CONST.currentSelectedInvestPlanType = Number(item.value);
            } else if (item.key === 'isRealInvest') {
                CONFIG_CONST.isRealInvest = Number(item.value) === 1;
            } else if (item.key === 'isUseLastAccountBalance') {
                AppSettings.isUseLastAccountBalance = Number(item.value) === 1;
            } else if (item.key === 'isUseReverseInvestNumbers') {
                AppSettings.isUseReverseInvestNumbers = Number(item.value) === 1;
            } else if (item.key === 'minProfitNotification') {
                AppSettings.minProfitNotification = Number(item.value);
            } else if (item.key === 'maxProfitNotification') {
                AppSettings.maxProfitNotification = Number(item.value);
            } else if (item.key === 'siteUrl') {
                CONFIG_CONST.siteUrl = item.value;
            } else if (item.key === 'investEndTime') {
                AppSettings.investEndTime = item.value;
            } else if (item.key === 'isEnableInvestInMock') {
                AppSettings.isEnableInvestInMock = Number(item.value) === 1;
            } else if (item.key === 'investNotification') {
                AppSettings.investNotification = Number(item.value) === 1;
            } else if (item.key === 'isStopCheckLastPrizeNumber') {
                AppSettings.isStopCheckLastPrizeNumber = Number(item.value) === 1;
            }
        }
    }

    /**
     *
     * 从数据库中获取配置并初始化
     */
    public static getAndInitSettings(): BlueBirdPromise<any> {
        return LotteryDbService.getSettingsInfoList()
            .then((settingInfoList: Array<SettingsInfo>) => {
                SettingService.initSettings(settingInfoList);
                return settingInfoList;
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }

    /**
     *
     * 切换到模拟投注
     */
    public static switchToMockInvest(): BlueBirdPromise<any> {
        //切换到模拟投注
        CONFIG_CONST.isRealInvest = false;
        return LotteryDbService.saveOrUpdate_UpdateSettingsInfo(update_isRealInvest_to_mock);

    }

    /**
     *
     * 切换到真实投注
     */
    public static switchToRealInvest(): BlueBirdPromise<any> {
        //切换到真实投注
        CONFIG_CONST.isRealInvest = true;
        //自动切换到真实投注
        return LotteryDbService.saveOrUpdate_UpdateSettingsInfo(update_isRealInvest_to_real);
    }
}
