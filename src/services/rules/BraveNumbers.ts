import {IRules} from "./IRules";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

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
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();
        //开奖号码信息
        let prizeFirst = String(prizeNumber.wan);
        let prizeSecond = String(prizeNumber.qian);
        let prizeThird = String(prizeNumber.bai);
        let prizeForth = String(prizeNumber.shi);
        let prizeFifth = String(prizeNumber.ge);

        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            if (item.indexOf(prizeFirst) > -1 || item.indexOf(prizeSecond) > -1 || item.indexOf(prizeThird) > -1 || item.indexOf(prizeForth) > -1 || item.indexOf(prizeFifth) > -1) {
                restNumberArray.push(item);
            }
        }

        log.info('胆码：%s', prizeNumber.prizeString);
        let ruleResult: CommonKillNumberResult = {
            killNumber: prizeNumber.prizeString,
            killNumberResult: restNumberArray
        };

        return Promise.resolve(ruleResult);
    }
}