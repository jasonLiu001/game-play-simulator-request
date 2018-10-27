import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";
import {InvestInfo} from "../../models/db/InvestInfo";
import {LotteryDbService} from "../dbservices/ORMService";

let log4js = require('log4js'),
    log = log4js.getLogger('ExtraInvestService');

/**
 *
 * 特别投注服务，在这里的方法可以在模拟投注时，直接进行真实投注
 */
export class ExtraInvestService {
    /**
     *
     * 三局中错误两局 "对错错" 这种形式才行 当天10点以后
     * @param planType 当前选择的方案类型
     * @param historyCount 需要取的历史奖号数量
     * @param tableName  数据表名称 invest和invest_total表
     * @param afterTime 取历史奖号的开始时间，默认是当天10点以后
     */
    public async investWhenFindTwoErrorInThree(planType: number, historyCount: number, tableName: string, afterTime: string = '10:00:00'): BlueBirdPromise<boolean> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = [];
        if (tableName == CONST_INVEST_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestInfoHistory(planType, historyCount, today + " " + afterTime);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, historyCount, today + " " + afterTime);
        }

        //数量不足 直接返回
        if (historyData.length < historyCount) return BlueBirdPromise.resolve(false);

        //连错数量
        let continueLoseTimes: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1) {
                if (investItem.isWin == 1) {
                    continueLoseTimes++;
                }
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