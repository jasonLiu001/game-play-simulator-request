import {IRules} from "./IRules";
import {Config} from "../../config/Config";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";

let log4js = require('log4js'),
    log = log4js.getLogger('BraveNumbers');

/**
 *
 * 定胆
 */
export class BraveNumbers extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    public filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        let last_PrizeNumber = Config.globalVariable.last_PrizeNumber;
        //开奖号码信息
        let prizeFirst = last_PrizeNumber.charAt(0);
        let prizeSecond = last_PrizeNumber.charAt(1);
        let prizeThird = last_PrizeNumber.charAt(2);
        let prizeForth = last_PrizeNumber.charAt(3);
        let prizeFifth = last_PrizeNumber.charAt(4);

        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            if (item.indexOf(prizeFirst) > -1 || item.indexOf(prizeSecond) > -1 || item.indexOf(prizeThird) > -1 || item.indexOf(prizeForth) > -1 || item.indexOf(prizeFifth) > -1) {
                restNumberArray.push(item);
            }
        }

        log.info('胆码：%s', last_PrizeNumber);
        let ruleResult: CommonKillNumberResult = {
            killNumber: last_PrizeNumber,
            killNumberResult: restNumberArray
        };

        return Promise.resolve(ruleResult);
    }
}