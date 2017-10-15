import {IRules} from "../IRules";
import {CONFIG_CONST} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/db/AwardInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberLastThreeOpenNumbers');

/**
 *
 *
 * 上期开啥 本期杀啥
 */
export class KillNumberLastThreeOpenNumbers extends AbstractRuleBase implements IRules {
    filterNumbers(): Promise<Array<string>> {
        let totalNumberArray = this.getTotalNumberArray();
        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length < CONFIG_CONST.historyCount) return Promise.reject("杀上期的开奖号码条件，数据库中至少有" + CONFIG_CONST.historyCount + "期历史开奖号码");

                //最新一期开奖号
                let last_01 = awardHistoryList[0].openNumber;
                //上上期开奖号码
                let last_02 = awardHistoryList[1].openNumber;
                //上上上期开奖号码
                let last_03 = awardHistoryList[2].openNumber;
                //杀百位
                let dropBaiWeiNumberArray = [last_01.substr(2, 1), last_02.substr(2, 1), last_03.substr(2, 1)];
                log.info('杀百位号码：%s', dropBaiWeiNumberArray.toString());
                //杀十位
                let dropShiWeiNumberArray = [last_01.substr(3, 1), last_02.substr(3, 1), last_03.substr(3, 1)];
                log.info('杀十位号码：%s', dropShiWeiNumberArray.toString());
                //杀个位
                let dropGeWeiNumberArray = [last_01.substr(4, 1), last_02.substr(4, 1), last_03.substr(4, 1)];
                log.info('杀个位号码：%s', dropGeWeiNumberArray.toString());

                let restArray = this.getRestKillNumberArray(totalNumberArray, dropBaiWeiNumberArray, dropShiWeiNumberArray, dropGeWeiNumberArray);
                return restArray;
            });
    }
}
