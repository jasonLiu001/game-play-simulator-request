import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import _ = require('lodash');
import {InvestInfo} from "../../models/db/InvestInfo";
import {AppSettings} from "../../config/AppSettings";
import {Tencent75TimeService} from "../time/Tencent75TimeService";
import {PlatformService} from "../platform/PlatformService";
import {EnumDbTableName, EnumNotificationType} from "../../models/EnumModel";
import {NotificationSender} from "../notification/NotificationSender";
import {AbstractRuleBase} from "../rules/AbstractRuleBase";
import {AwardService} from "../award/AwardService";
import {ConstVars} from "../../global/ConstVars";
import {InvestBase} from "./InvestBase";
import {InvestTableService} from "../dbservices/services/InvestTableService";
import {SettingTableService} from "../dbservices/services/SettingTableService";

let log4js = require('log4js'),
    log = log4js.getLogger('DoubleInvestService');

/**
 *
 * 倍投服务
 */
export class DoubleInvestService extends InvestBase {
    /**
     *
     * 执行投注入口
     */
    async executeDoubleInvestService(request: any): BlueBirdPromise<any> {

        //倍投模式
        let doubleInvestAwardModeArray: Array<string> = AppSettings.doubleInvest_AwardMode.split(",");
        //当前倍投模式
        let currentDoubleInvestAwardMode: string = doubleInvestAwardModeArray[0];
        log.info("当前倍投模式参数值：%s，正在执行倍投模式：%s", doubleInvestAwardModeArray.join(","), currentDoubleInvestAwardMode);
        //倍投倍数
        let doubleInvestTouZhuBeiShuArray: Array<string> = AppSettings.doubleInvest_TouZhuBeiShu.split(",");
        //当前倍投倍数
        let currentDoubleInvestTouZhuBeiShu: string = doubleInvestTouZhuBeiShuArray[0];
        log.info("当前倍投倍数参数值：%s，正在执行倍投倍数：%s", doubleInvestTouZhuBeiShuArray.join(","), currentDoubleInvestTouZhuBeiShu);

        //放弃倍投条件1
        if (doubleInvestAwardModeArray.length != doubleInvestTouZhuBeiShuArray.length) return BlueBirdPromise.reject("放弃执行倍投，原因：倍投模式：" + AppSettings.doubleInvest_AwardMode + " 倍投倍数：" + AppSettings.doubleInvest_TouZhuBeiShu + "，两者值个数不一致");

        //放弃倍投条件2
        let historyData: Array<InvestInfo> = await InvestTableService.getInvestInfoHistoryByTableName(EnumDbTableName.INVEST_TOTAL, AppSettings.doubleInvest_CurrentSelectedInvestPlanType, 2);
        if (historyData.length < 2) return BlueBirdPromise.reject("放弃执行倍投，原因：invest_total表中记录不足2条");

        //取上一期投注数据 因为本期还在执行中
        if (historyData[1].status === 0) {//本期执行投注，但是上期仍然未开奖，手动更新
            //更新历史奖号
            let updateHistoryAward = await  AwardService.saveOrUpdateHistoryAwardByDate(moment().format(ConstVars.momentDateFormatter));
            //计算当前盈利
            let calculateWinMoneyResult = await this.calculateWinMoney();
        }

        //上期已中奖 并且当前是正向投注时 则本期倍投取消
        if (!AppSettings.doubleInvest_IsUseReverseInvestNumbers && historyData[1].status === 1 && historyData[1].isWin === 1) {
            return this.stopDoubleInvest(currentDoubleInvestTouZhuBeiShu, historyData);//停止倍投
        } else if (AppSettings.doubleInvest_IsUseReverseInvestNumbers && historyData[1].status === 1 && historyData[1].isWin === 0) {//反向投注 并且上期中 则本期倍投取消
            return this.stopDoubleInvest(currentDoubleInvestTouZhuBeiShu, historyData);//停止倍投
        }

        //当前期号
        let currentPeriod = Tencent75TimeService.getCurrentPeriodNumber(new Date());
        //倍投时选取 invest_total表 投注方案
        return InvestTableService.getInvestInfoByTableName(EnumDbTableName.INVEST_TOTAL, currentPeriod, AppSettings.doubleInvest_CurrentSelectedInvestPlanType)
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.reject("倍投执行失败，invest_total表中未查询到方案：" + AppSettings.doubleInvest_CurrentSelectedInvestPlanType + "，投注信息");
                //修改 倍投模式
                investInfo.awardMode = Number(currentDoubleInvestAwardMode);
                //修改 倍投倍数
                investInfo.touZhuBeiShu = Number(currentDoubleInvestTouZhuBeiShu);
                //修改 倍投号码是否取反
                if (AppSettings.doubleInvest_IsUseReverseInvestNumbers) {
                    //从1000注中移除特定号码，得到相反的号码
                    let abstractRuleBase = new AbstractRuleBase();
                    let diffArray: Array<string> = _.difference(abstractRuleBase.getTotalNumberArray(), investInfo.investNumbers.split(","));
                    investInfo.investNumbers = diffArray.join(',');
                    log.info('倍投时 使用正常反向投注号码 投注...');
                }

                return BlueBirdPromise.resolve(investInfo);
            })
            .then((investInfo: InvestInfo) => {
                //执行真实投注
                return this.startDoubleInvest(request, investInfo, currentDoubleInvestAwardMode, currentDoubleInvestTouZhuBeiShu, doubleInvestAwardModeArray, doubleInvestTouZhuBeiShuArray);
            });
    }

    private async startDoubleInvest(request: any, investInfo: InvestInfo, currentDoubleInvestAwardMode: string, currentDoubleInvestTouZhuBeiShu: string, doubleInvestAwardModeArray: Array<string>, doubleInvestTouZhuBeiShuArray: Array<string>): BlueBirdPromise<any> {
        return PlatformService.loginAndInvest(request, investInfo)
            .then(() => {
                log.info("%s 期倍投完成，倍投模式：%s，倍投倍数：%s，开始更新下期倍投参数值", investInfo.period, currentDoubleInvestAwardMode, currentDoubleInvestTouZhuBeiShu);
                if (doubleInvestAwardModeArray.length > 1 && doubleInvestTouZhuBeiShuArray.length > 1) {
                    //移除当前倍投模式
                    doubleInvestAwardModeArray.shift();
                    //移除当前倍投倍数
                    doubleInvestTouZhuBeiShuArray.shift();
                    //更新倍投参数值
                    return this.updateDoubleInvestSettings(doubleInvestAwardModeArray.join(","), doubleInvestTouZhuBeiShuArray.join(","), AppSettings.doubleInvest_IsUseReverseInvestNumbers ? "1" : "0", String(AppSettings.doubleInvest_CurrentSelectedInvestPlanType));
                } else {//如果倍投为最后一期时，修改数组中的值为0
                    return this.updateDoubleInvestSettings("0", "0", "0", "1");
                }
            })
            .then(() => {
                let emailContent: string = "倍投模式：" + currentDoubleInvestAwardMode + "，倍投倍数：" + currentDoubleInvestTouZhuBeiShu;
                return NotificationSender.send(investInfo.period + '期 正在执行倍投操作', emailContent, EnumNotificationType.PUSH_AND_EMAIL);
            });
    }

    /**
     *
     * 停止倍投
     */
    private async stopDoubleInvest(currentDoubleInvestTouZhuBeiShu: string, historyData: Array<InvestInfo>): BlueBirdPromise<any> {
        return this.updateDoubleInvestSettings("0", "0", "0", "1")
            .then(() => {
                let emailContent: string = "恭喜！倍投进行到" + currentDoubleInvestTouZhuBeiShu + "倍时，上期已中奖，无需继续投注！";
                log.info(emailContent);
                return NotificationSender.send(historyData[0].period + '期 倍投自动终止，上期已中奖', emailContent, EnumNotificationType.PUSH_AND_EMAIL);
            });
    }

    /**
     *
     * 更新倍投参数值
     */
    async updateDoubleInvestSettings(doubleInvestAwardModeValue: string, doubleInvestTouZhuBeiShuValue: string, doubleInvest_IsUseReverseInvestNumbersValue: string, doubleInvest_CurrentSelectedInvestPlanTypeValue: string): BlueBirdPromise<any> {
        return SettingTableService.saveOrUpdateSettingsInfo(
            {
                key: 'doubleInvest_AwardMode',
                value: doubleInvestAwardModeValue
            })
            .then(() => {
                return SettingTableService.saveOrUpdateSettingsInfo(
                    {
                        key: 'doubleInvest_TouZhuBeiShu',
                        value: doubleInvestTouZhuBeiShuValue
                    });
            })
            .then(() => {
                return SettingTableService.saveOrUpdateSettingsInfo(
                    {
                        key: 'doubleInvest_IsUseReverseInvestNumbers',
                        value: doubleInvest_IsUseReverseInvestNumbersValue
                    });
            })
            .then(() => {
                return SettingTableService.saveOrUpdateSettingsInfo(
                    {
                        key: 'doubleInvest_CurrentSelectedInvestPlanType',
                        value: doubleInvest_CurrentSelectedInvestPlanTypeValue
                    });
            });
    }
}
