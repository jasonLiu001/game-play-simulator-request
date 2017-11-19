import {IRules} from "./IRules";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

let log4js = require('log4js'),
    log = log4js.getLogger('BraveNumbers');

/**
 *
 * 6胆
 * 倒数第一期万位分别加1,6,9,3,8,4后的各自结果取和尾组成6位胆码
 */
export class BraveNumbers extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    public filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();

        //6位胆码
        let prizeFirst = String((prizeNumber.wan + 1) % 10);
        let prizeSecond = String((prizeNumber.wan + 6) % 10);
        let prizeThird = String((prizeNumber.wan + 9) % 10);
        let prizeForth = String((prizeNumber.wan + 3) % 10);
        let prizeFifth = String((prizeNumber.wan + 8) % 10);
        let prizeSixth = String((prizeNumber.wan + 4)) % 10;

        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            if (item.indexOf(prizeFirst) > -1 || item.indexOf(prizeSecond) > -1 || item.indexOf(prizeThird) > -1 || item.indexOf(prizeForth) > -1 || item.indexOf(prizeFifth) > -1 || item.indexOf(prizeSixth) > -1) {
                restNumberArray.push(item);
            }
        }

        //胆码字符串
        let prizeString = [prizeFirst, prizeSecond, prizeThird, prizeForth, prizeFifth, prizeSixth].join(',');
        log.info('胆码：%s', prizeString);
        let ruleResult: CommonKillNumberResult = {
            killNumber: prizeString,
            killNumberResult: restNumberArray
        };

        return Promise.resolve(ruleResult);
    }
}