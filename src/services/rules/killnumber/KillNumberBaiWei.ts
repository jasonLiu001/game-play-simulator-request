import {IRules} from "../IRules";
import {CONFIG_CONST} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {AwardInfo} from "../../../models/db/AwardInfo";
import {RejectionMsg} from "../../../models/EnumModel";
import {FixedPositionKillNumberResult} from "../../../models/RuleResult";
import {AwardTableService} from "../../dbservices/services/AwardTableService";
import Promise = require('bluebird');

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberBaiWei');


/**
 *
 * 杀百位
 * 取倒数第三期的十位
 */
export class KillNumberBaiWei extends AbstractRuleBase implements IRules<FixedPositionKillNumberResult> {
    filterNumbers(): Promise<FixedPositionKillNumberResult> {
        let totalNumberArray = this.getTotalNumberArray();
        return AwardTableService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀百位提示：" + RejectionMsg.historyCountIsNotEnough);

                //倒数第三期
                let last_03 = awardHistoryList[2].openNumber;
                //需要杀掉的百位号码 倒数第三期 十位号码
                let killNumber = last_03.substr(3, 1);

                let dropBaiWeiNumberArray: Array<string> = [];
                dropBaiWeiNumberArray.push(killNumber);
                let restArray = this.getRestKillNumberArray(totalNumberArray, dropBaiWeiNumberArray, null, null);

                log.info('杀百位号码：%s', dropBaiWeiNumberArray.toString());
                let fixedPositionKillNumberResult: FixedPositionKillNumberResult = {
                    baiWei: {
                        killNumber: dropBaiWeiNumberArray.join(','),
                        killNumberResult: restArray
                    },
                    shiWei: null,
                    geWei: null,
                    finalResult: {
                        killNumber: dropBaiWeiNumberArray.join(','),
                        killNumberResult: restArray
                    }
                };

                return Promise.resolve(fixedPositionKillNumberResult);
            });
    }
}
