import {ErrorService} from "../ErrorService";
import {LotteryDbService} from "../dbservices/ORMService";
import {SettingsInfo} from "../../models/db/SettingsInfo";
import BlueBirdPromise = require('bluebird');
import {AppConfig} from "../../config/AppConfig";
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
                //CONFIG_CONST.originAccountBalance = Number(item.value);
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
            } else if (item.key === 'isRealInvest') {
                CONFIG_CONST.isRealInvest = Number(item.value) === 1;
            } else if (item.key === 'isInvestTotalTableUseLastAccountBalance') {
                Config.isInvestTotalTableUseLastAccountBalance = Number(item.value) === 1;
            } else if (item.key === 'isInvestTableUserLastAccountBalance') {
                Config.isInvestTableUserLastAccountBalance = Number(item.value) === 1;
            } else if (item.key === 'isUseReverseInvestNumbers') {
                AppConfig.isUseReverseInvestNumbers = Number(item.value) === 1;
            } else if (item.key === 'minProfitNotification') {
                AppConfig.minProfitNotification = Number(item.value);
            } else if (item.key === 'maxProfitNotification') {
                AppConfig.maxProfitNotification = Number(item.value);
            } else if (item.key === 'siteUrl') {
                CONFIG_CONST.siteUrl = item.value;
            } else if (item.key === 'investEndTime') {
                AppConfig.investEndTime = item.value;
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
}