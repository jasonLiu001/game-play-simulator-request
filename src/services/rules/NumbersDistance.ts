import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";
import {CONFIG_CONST} from "../../config/Config";
import {AwardInfo} from "../../models/db/AwardInfo";
import {RejectionMsg} from "../../models/EnumModel";
import {AwardTableService} from "../dbservices/services/AwardTableService";
import Promise = require('bluebird');

let log4js = require('log4js'),
    log = log4js.getLogger('NumbersDistance');

/**
 *
 * 杀跨度 倒数第二期后三号码*133得结果，取结果的第1位
 */
export class NumbersDistance extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        return AwardTableService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀跨提示：" + RejectionMsg.historyCountIsNotEnough);

                //倒数第二期 开奖号码
                let last_02 = awardHistoryList[1].openNumber;
                //需要杀的跨度值
                let killNumber_01 = Number(String(Number(last_02.substring(2)) * 133).substr(0, 1));

                let restNumberArray: Array<string> = [];
                //开奖号码
                let prizeNumber: OpenNumber = this.getPrizeNumberObj();

                let prizeNumberArray: Array<number> = [prizeNumber.bai, prizeNumber.shi, prizeNumber.ge];
                prizeNumberArray.sort(function (a, b) {
                    return a - b;
                });

                //上期跨度值
                let killNumber_02 = Math.abs(prizeNumberArray[0] - prizeNumberArray[2]);
                //暂时用心的杀跨度规则替代 使用上期的跨度规则
                let distanceValues: Array<number> = [];//支持杀多个跨度值
                distanceValues.push(killNumber_01);

                for (let i = 0; i < originNumberArray.length; i++) {
                    let item = originNumberArray[i];
                    let temp: Array<number> = [];
                    temp.push(Number(item.charAt(0)));
                    temp.push(Number(item.charAt(1)));
                    temp.push(Number(item.charAt(2)));
                    //先从小到大排序
                    temp.sort(function (a, b) {
                        return a - b;
                    });

                    //外层循环退出标记
                    let isContinue: boolean = false;
                    for (let j = 0; j < distanceValues.length; j++) {
                        let distanceItem = distanceValues[j];
                        if (Math.abs(temp[0] - temp[2]) == distanceItem) {
                            isContinue = true;//外层循环退出标记赋值
                            break;
                        }
                    }

                    if (isContinue) continue;
                    restNumberArray.push(item);
                }

                log.info('排除跨度值：%s', distanceValues.join(','));
                let ruleResult: CommonKillNumberResult = {
                    killNumber: distanceValues.join(','),
                    killNumberResult: restNumberArray
                };
                return Promise.resolve(ruleResult);
            });
    }
}
