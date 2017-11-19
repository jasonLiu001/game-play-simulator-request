import {IRules} from "../IRules";
import {CONFIG_CONST} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {AwardInfo} from "../../../models/db/AwardInfo";
import {RejectionMsg} from "../../../models/EnumModel";
import {FixedPositionKillNumberResult} from "../../../models/RuleResult";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberGeWei');

/**
 *
 *
 * 个位杀号
 * 取倒数第一期后三中最大数减倒数第一期后三中最小数的差
 */
export class KillNumberGeWei extends AbstractRuleBase implements IRules<FixedPositionKillNumberResult> {
    filterNumbers(): Promise<FixedPositionKillNumberResult> {
        let totalNumberArray = this.getTotalNumberArray();
        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀个位提示：" + RejectionMsg.historyCountIsNotEnough);

                //最新一期开奖号
                let last_01 = awardHistoryList[0].openNumber;

                let bai = Number(last_01.substr(2, 1));//百
                let shi = Number(last_01.substr(3, 1));//十
                let ge = Number(last_01.substr(4, 1));//个

                //杀掉的个位号码
                let killNumber = String(Math.abs(Math.max(bai, shi, ge) - Math.min(bai, shi, ge)));

                let dropGeWeiNumberArray: Array<string> = [];
                dropGeWeiNumberArray.push(killNumber);
                let restArray = this.getRestKillNumberArray(totalNumberArray, null, null, dropGeWeiNumberArray);

                log.info('杀个位号码：%s', dropGeWeiNumberArray.toString());
                let fixedPositionKillNumberResult: FixedPositionKillNumberResult = {
                    baiWei: null,
                    shiWei: null,
                    geWei: {
                        killNumber: dropGeWeiNumberArray.join(','),
                        killNumberResult: restArray
                    },
                    finalResult: {
                        killNumber: dropGeWeiNumberArray.join(','),
                        killNumberResult: restArray
                    }
                };

                return Promise.resolve(fixedPositionKillNumberResult);
            });
    }
}