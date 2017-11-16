import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import _ = require('lodash');
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

let log4js = require('log4js'),
    log = log4js.getLogger('NumbersDistance');

/**
 *
 * 杀跨度
 */
export class NumbersDistance extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();

        let prizeNumberArray: Array<number> = [prizeNumber.bai, prizeNumber.shi, prizeNumber.ge];
        prizeNumberArray.sort(function (a, b) {
            return a - b;
        });

        //上期跨度值
        let distanceValue = Math.abs(prizeNumberArray[0] - prizeNumberArray[2]);

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

            if (Math.abs(temp[0] - temp[2]) == distanceValue)  continue;

            restNumberArray.push(item);
        }

        log.info('排除跨度值：%s', distanceValue);
        let ruleResult: CommonKillNumberResult = {
            killNumber: String(distanceValue),
            killNumberResult: restNumberArray
        };
        return Promise.resolve(ruleResult);
    }
}
