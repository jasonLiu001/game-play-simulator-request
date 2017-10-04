import {IRules} from "../IRules";
import {Config} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/AwardInfo";
import {Utility} from "../../Utility";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberLastOpenNumber');

/**
 *
 *
 * 上期开啥 本期杀啥
 */
export class KillNumberLastOpenNumber extends AbstractRuleBase implements IRules {
    filterNumbers(config: Config, lotteryDbService: LotteryDbService): Promise<Array<string>> {
        let historyCount = 1;
        let totalNumberArray = this.getTotalNumberArray();
        return lotteryDbService.getAwardInfoHistory(historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length < 1) return Promise.reject("杀上期的开奖号码条件，数据库中至少有1期历史开奖号码");

                //最新一期开奖号
                let last_01 = Utility.getPrizeNumber(config, awardHistoryList[0].openNumber);
                //杀百位
                let dropBaiWeiNumberArray = [last_01.substr(0, 1)];
                //杀十位
                let dropShiWeiNumberArray = [last_01.substr(1, 1)];
                //杀个位
                let dropGeWeiNumberArray = [last_01.substr(2, 1)];

                let restArray = this.getRestKillNumberArray(config, totalNumberArray, dropBaiWeiNumberArray, dropShiWeiNumberArray, dropGeWeiNumberArray);
                return restArray;
            });
    }
}
