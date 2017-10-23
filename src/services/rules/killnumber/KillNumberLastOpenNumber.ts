import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/db/AwardInfo";
import {FixedPositionKillNumberResult} from "../../../models/RuleResult";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberLastOpenNumber');

/**
 *
 *
 * 上期开啥 本期杀啥
 */
export class KillNumberLastOpenNumber extends AbstractRuleBase implements IRules<FixedPositionKillNumberResult> {
    filterNumbers(): Promise<FixedPositionKillNumberResult> {
        let historyCount = 1;
        let totalNumberArray = this.getTotalNumberArray();
        return LotteryDbService.getAwardInfoHistory(historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length < 1) return Promise.reject("杀上期的开奖号码条件，数据库中至少有1期历史开奖号码");

                //最新一期开奖号
                let last_01 = awardHistoryList[0].openNumber;
                //杀百位
                let dropBaiWeiNumberArray = [last_01.substr(2, 1)];
                log.info('杀百位号码：%s', dropBaiWeiNumberArray.toString());
                //杀十位
                let dropShiWeiNumberArray = [last_01.substr(3, 1)];
                log.info('杀十位号码：%s', dropShiWeiNumberArray.toString());
                //杀个位
                let dropGeWeiNumberArray = [last_01.substr(4, 1)];
                log.info('杀个位号码：%s', dropGeWeiNumberArray.toString());

                let restArray = this.getRestKillNumberArray(totalNumberArray, dropBaiWeiNumberArray, dropShiWeiNumberArray, dropGeWeiNumberArray);

                let fixedPositionKillNumberResult: FixedPositionKillNumberResult = {
                    baiWei: {
                        killNumber: dropBaiWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(totalNumberArray, dropBaiWeiNumberArray, null, null)
                    },
                    shiWei: {
                        killNumber: dropShiWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(totalNumberArray, null, dropShiWeiNumberArray, null)
                    },
                    geWei: {
                        killNumber: dropGeWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(totalNumberArray, null, null, dropGeWeiNumberArray)
                    },
                    finalResult: {
                        killNumber: _.union(dropBaiWeiNumberArray, dropShiWeiNumberArray, dropGeWeiNumberArray).join(','),
                        killNumberResult: restArray
                    }
                };

                return Promise.resolve(fixedPositionKillNumberResult);
            });
    }
}
