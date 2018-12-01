import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {InvestInfo} from "../../models/db/InvestInfo";
import {LotteryDbService} from "../dbservices/ORMService";
import {CONFIG_CONST} from "../../config/Config";
import {EmailSender} from "../email/EmailSender";
import {PlatformService} from "../platform/PlatformService";
import {SettingService} from "../settings/SettingService";

let log4js = require('log4js'),
    log = log4js.getLogger('ExtraInvestService');

/**
 *
 * 特别投注服务，在这里的方法可以在模拟投注时，直接进行真实投注
 */
export class ExtraInvestService {

    /**
     *
     * 执行投注入口
     * @returns {Bluebird<any>}
     */
    public executeExtraInvest(request: any, investInfo: InvestInfo): BlueBirdPromise<any> {
        //首先判断是否满足特定的投注形态 不受当天最高盈利限制
        return this.investWhenFindTwoErrorInThree(CONFIG_CONST.currentSelectedInvestPlanType, 3)
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
                            })
                        }).then(() => {
                            PlatformService.loginAndInvest(request, investInfo)
                                .then(() => {
                                    let emailContent: string = "程序已忽略设置，自动投注，盈利目标从：" + investInfo.currentAccountBalance + " 更新为：" + CONFIG_CONST.maxAccountBalance;
                                    return EmailSender.sendEmail(investInfo.period + ' 符合对错错条件', emailContent)
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
     * @param afterTime 取历史奖号的开始时间，默认是当天10点以后
     */
    public async investWhenFindTwoErrorInThree(planType: number, historyCount: number, afterTime: string = '10:00:00'): BlueBirdPromise<boolean> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(planType, historyCount, today + " " + afterTime);

        //数量不足 直接返回
        if (historyData.length < historyCount) return BlueBirdPromise.resolve(false);

        //连错数量
        let continueLoseTimes: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1 && investItem.isWin == 0) {
                continueLoseTimes++;
            }
        }

        //没有连错直接返回
        if (continueLoseTimes < historyCount - 1) return BlueBirdPromise.resolve(false);

        //三条记录中的第1条
        let firstRecord: InvestInfo = historyData[historyData.length - 1];

        //三条记录的错误状态为“对错错”才能自行投注
        if (firstRecord.status == 1 && firstRecord.isWin == 1 && continueLoseTimes == historyCount - 1) {
            return BlueBirdPromise.resolve(true);
        }

        return BlueBirdPromise.resolve(false);
    }
}
