import {IRules} from "../IRules";
import {Config, CONFIG_CONST} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/AwardInfo";
import {Utility} from "../../Utility";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberLastThreeOpenNumbers');

/**
 *
 *
 * 上期开啥 本期杀啥
 */
export class KillNumberLastThreeOpenNumbers extends AbstractRuleBase implements IRules {
    filterNumbers(config: Config, lotteryDbService: LotteryDbService): Promise<Array<string>> {
        let totalNumberArray = this.getTotalNumberArray();
        return lotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length < CONFIG_CONST.historyCount) return Promise.reject("杀上期的开奖号码条件，数据库中至少有" + CONFIG_CONST.historyCount + "期历史开奖号码");

                //最新一期开奖号
                let last_01 = Utility.getPrizeNumber(config, awardHistoryList[0].openNumber);
                //上上期开奖号码
                let last_02 = Utility.getPrizeNumber(config, awardHistoryList[1].openNumber);
                //上上上期开奖号码
                let last_03 = Utility.getPrizeNumber(config, awardHistoryList[2].openNumber);
                //杀百位
                let dropBaiWeiNumberArray = [last_01.substr(0, 1), last_02.substr(0, 1), last_03.substr(0, 1)];
                //杀十位
                let dropShiWeiNumberArray = [last_01.substr(1, 1), last_02.substr(1, 1), last_03.substr(1, 1)];
                //杀个位
                let dropGeWeiNumberArray = [last_01.substr(2, 1), last_02.substr(2, 1), last_03.substr(2, 1)];

                let restArray = this.getRestKillNumberArray(config, totalNumberArray, dropBaiWeiNumberArray, dropShiWeiNumberArray, dropGeWeiNumberArray);
                return restArray;
            });
    }
}
