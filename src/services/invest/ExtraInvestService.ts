import BlueBirdPromise = require('bluebird');
import {InvestInfo} from "../../models/db/InvestInfo";
import {LotteryDbService} from "../dbservices/ORMService";
import {CONFIG_CONST} from "../../config/Config";
import {NotificationSender} from "../notification/NotificationSender";
import {PlatformService} from "../platform/PlatformService";
import {SettingService} from "../settings/SettingService";
import {EnumNotificationType} from "../../models/EnumModel";
import {InvestBase} from "./InvestBase";
import {InvestTableService} from "../dbservices/services/InvestTableService";

let log4js = require('log4js'),
    log = log4js.getLogger('ExtraInvestService');

/**
 *
 * 特别投注服务，在这里的方法可以在模拟投注时，直接进行真实投注
 */
export class ExtraInvestService extends InvestBase {

    /**
     *
     * 执行投注入口
     */
    public executeExtraInvest(request: any, investInfo: InvestInfo): BlueBirdPromise<any> {
        //首先判断是否满足特定的投注形态 不受当天最高盈利限制
        return this.investWhenFindTwoErrorInThree(CONFIG_CONST.currentSelectedInvestPlanType, 4)
            .then((isCanInvest) => {
                if (isCanInvest) {//满足特定的投注形态 自动进入真实投注
                    log.info('忽略设置，自动启用正式投注...');
                    return SettingService.switchToRealInvest()
                        .then(() => {
                            //更新停止投注的最大盈利值
                            CONFIG_CONST.maxAccountBalance = investInfo.currentAccountBalance + 1;
                            return LotteryDbService.saveOrUpdateSettingsInfo({
                                key: 'maxAccountBalance',
                                value: String(CONFIG_CONST.maxAccountBalance)
                            });
                        }).then(() => {
                            return PlatformService.loginAndInvest(request, investInfo)
                                .then(() => {
                                    let emailContent: string = "程序已忽略设置，自动投注，盈利目标从：" + investInfo.currentAccountBalance + " 更新为：" + CONFIG_CONST.maxAccountBalance;
                                    return NotificationSender.send(investInfo.period + ' 符合对错错条件', emailContent, EnumNotificationType.PUSH_AND_EMAIL);
                                });
                        });

                }
            });
    }


    /**
     *
     * 三局中错误两局 "对错错" 这种形式才行 当天10点以后
     * @param planType 当前选择的方案类型
     * @param historyCount 需要取的历史奖号数量
     */
    public async investWhenFindTwoErrorInThree(planType: number, historyCount: number): BlueBirdPromise<boolean> {
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = await InvestTableService.getInvestInfoHistory(planType, historyCount,);

        //数量不足 直接返回
        if (historyData.length < historyCount) return BlueBirdPromise.resolve(false);

        let latestInvestInfo: InvestInfo = historyData[0];
        if (latestInvestInfo.status === 0) {//进行中
            //移除进行中的这一期 删除数组的第一个元素
            historyData.shift();
        } else if (latestInvestInfo.status === 1) {//已完成
            //删除数组的最后一个元素
            historyData.pop();
        }

        //连错数量 historyData最终的数量为3个
        let continueLoseTimes: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1 && investItem.isWin == 0) {
                continueLoseTimes++;
            }
        }

        //没有连错直接返回 3期中不存在2错 则返回
        if (continueLoseTimes < historyCount - 2) return BlueBirdPromise.resolve(false);

        //三条记录中的第1条
        let firstRecord: InvestInfo = historyData[historyData.length - 1];

        //三条记录的错误状态为“对错错”才能自行投注
        if (firstRecord.status == 1 && firstRecord.isWin == 1 && continueLoseTimes == historyCount - 1) {
            return BlueBirdPromise.resolve(true);
        }

        return BlueBirdPromise.resolve(false);
    }
}
