import BlueBirdPromise = require('bluebird');
import _ = require('lodash');
import {InvestInfo} from "../../models/db/InvestInfo";
import {AppSettings} from "../../config/AppSettings";
import {TimeService} from "../time/TimeService";
import {LotteryDbService} from "../dbservices/ORMService";
import {PlatformService} from "../platform/PlatformService";
import {EnumNotificationType} from "../../models/EnumModel";
import {NotificationSender} from "../notification/NotificationSender";
import {AbstractRuleBase} from "../rules/AbstractRuleBase";

let log4js = require('log4js'),
    log = log4js.getLogger('DoubleInvestService');

/**
 *
 * 倍投服务
 */
export class DoubleInvestService {
    /**
     *
     * 执行投注入口
     */
    public executeDoubleInvestService(request: any): BlueBirdPromise<any> {

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

        if (doubleInvestAwardModeArray.length != doubleInvestTouZhuBeiShuArray.length) return BlueBirdPromise.reject("放弃执行倍投，原因：倍投模式：" + AppSettings.doubleInvest_AwardMode + " 倍投倍数：" + AppSettings.doubleInvest_TouZhuBeiShu + "，两者值个数不一致");

        //当前期号
        let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
        //倍投时选取 invest_total表 投注方案
        return LotteryDbService.getInvestTotalInfo(currentPeriod, AppSettings.doubleInvest_CurrentSelectedInvestPlanType)
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
                return PlatformService.loginAndInvest(request, investInfo)
                    .then(() => {
                        log.info("%s 期倍投完成，倍投模式：%s，倍投倍数：%s，开始更新下期倍投参数值", investInfo.period, currentDoubleInvestAwardMode, currentDoubleInvestTouZhuBeiShu);
                        if (doubleInvestAwardModeArray.length > 1 && doubleInvestTouZhuBeiShuArray.length > 1) {
                            //移除当前倍投模式
                            doubleInvestAwardModeArray.shift();
                            //移除当前倍投倍数
                            doubleInvestTouZhuBeiShuArray.shift();
                        } else {//如果倍投为最后一期时，修改数组中的值为0
                            //更新当前倍投模式
                            doubleInvestAwardModeArray.splice(0, 1, "0");
                            //更新当前倍投倍数
                            doubleInvestTouZhuBeiShuArray.splice(0, 1, "0");
                        }

                        //更新倍投参数值
                        return LotteryDbService.saveOrUpdateSettingsInfo(
                            {
                                key: 'doubleInvest_AwardMode',
                                value: doubleInvestAwardModeArray.join(",")
                            })
                            .then(() => {
                                return LotteryDbService.saveOrUpdateSettingsInfo(
                                    {
                                        key: 'doubleInvest_TouZhuBeiShu',
                                        value: doubleInvestTouZhuBeiShuArray.join(",")
                                    });
                            });
                    })
                    .then(() => {
                        let emailContent: string = "倍投模式：" + currentDoubleInvestAwardMode + "，倍投倍数：" + currentDoubleInvestTouZhuBeiShu;
                        return NotificationSender.send(investInfo.period + ' 正在执行倍投操作', emailContent, EnumNotificationType.PUSH_AND_EMAIL);
                    });
            });
    }
}