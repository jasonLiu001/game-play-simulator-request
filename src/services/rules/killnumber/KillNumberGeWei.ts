import {IRules} from "../IRules";
import {Config, CONFIG_CONST} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/AwardInfo";
import {RejectionMsg} from "../../../models/EnumModel";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberGeWei');

/**
 *
 *
 * 个位杀号
 */
export class KillNumberGeWei extends AbstractRuleBase implements IRules {
    filterNumbers(lotteryDbService: LotteryDbService): Promise<Array<string>> {
        let totalNumberArray = this.getTotalNumberArray();
        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject(RejectionMsg.historyCountIsNotEnough);

                //最新一期开奖号
                let last_01 = awardHistoryList[0].openNumber;
                //上上期开奖号码
                let last_02 = awardHistoryList[1].openNumber;
                let diff = Number(last_01.substring(4)) - Number(last_02.substring(4));
                if (!(diff == -1 || diff == 1)) {
                    return Promise.reject("历史开奖号码不满足个位杀号条件");
                }
                let killNumber;
                if (diff == 1) {
                    //个位杀号
                    killNumber = (Number(last_01.substring(4)) + 1) % 10;
                } else {
                    killNumber = Number(last_01.substring(4)) - 1;
                }
                let dropGeWeiNumberArray: Array<string> = [];
                dropGeWeiNumberArray.push(killNumber);

                let restArray = this.getRestKillNumberArray(totalNumberArray, null, null, dropGeWeiNumberArray);
                return restArray;
            });
    }
}