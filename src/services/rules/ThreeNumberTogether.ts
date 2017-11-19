import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import _ = require('lodash');
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

let log4js = require('log4js'),
    log = log4js.getLogger('ThreeNumberTogether');

/**
 *
 * 杀3连号
 */
export class ThreeNumberTogether extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];

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

            if ((Math.abs(temp[0] - temp[1]) == 1 && Math.abs(temp[1] - temp[2]) == 1 && Math.abs(temp[0] - temp[2]) == 2)
                || (temp[0] == 0 && temp[1] == 1 && temp[2] == 9) || (temp[0] == 0 && temp[1] == 8 && temp[2] == 9)) {
                continue;
            }

            restNumberArray.push(item);
        }
        log.info('排除三连号码后剩余：%s 个', restNumberArray.length);
        let ruleResult: CommonKillNumberResult = {
            killNumber: restNumberArray.join(','),
            killNumberResult: restNumberArray
        };
        return Promise.resolve(ruleResult);
    }
}
