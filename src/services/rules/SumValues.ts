import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";
import Promise = require('bluebird');

let log4js = require('log4js'),
    log = log4js.getLogger('SumValues');

/**
 *
 * 和值杀号
 */
export class SumValues extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();
        //和值
        let sumValues: number = prizeNumber.bai + prizeNumber.shi + prizeNumber.ge;
        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            let itemSumValues = Number(item.charAt(0)) + Number(item.charAt(1)) + Number(item.charAt(2));
            //杀和值
            if (itemSumValues == sumValues) continue;
            restNumberArray.push(item);
        }

        log.info('排除和值：%s', sumValues);
        let ruleResult: CommonKillNumberResult = {
            killNumber: String(sumValues),
            killNumberResult: restNumberArray
        };

        return Promise.resolve(ruleResult);
    }
}
