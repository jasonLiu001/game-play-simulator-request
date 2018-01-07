import {IRules} from "./IRules";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

let log4js = require('log4js'),
    log = log4js.getLogger('JiOuType');

/**
 *
 * 杀奇偶类型
 */
export class JiOuType extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    public filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();

        //上期开奖号码后三奇偶 倒杀
        let baiWeiJiOuType = this.getJiEouType(prizeNumber.bai);//百位奇偶类型
        let shiWeiJiOuType = this.getJiEouType(prizeNumber.shi);//十位奇偶类型
        let geWeiJiOuType = this.getJiEouType(prizeNumber.ge);//个位奇偶类型
        let lastPrizeNumberJiOuType = baiWeiJiOuType + '' + shiWeiJiOuType + '' + geWeiJiOuType;

        //杀奇偶
        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            //奇偶类型
            let firstJiEouType = this.getJiEouType(Number(item.charAt(0)));
            let secondJiEouType = this.getJiEouType(Number(item.charAt(1)));
            let thirdJiEouType = this.getJiEouType(Number(item.charAt(2)));
            let JiOuType = firstJiEouType + '' + secondJiEouType + '' + thirdJiEouType;

            //杀奇偶
            switch (lastPrizeNumberJiOuType) {
                case '000'://偶偶偶 杀奇奇奇
                {
                    if (JiOuType == '111' || JiOuType == '000') {
                        continue;
                    }
                }
                    break;
                case '111':// 杀奇奇奇
                {
                    if (JiOuType == '000' || JiOuType == '111') {
                        continue;
                    }
                }
                    break;
                case '110'://奇奇偶 杀偶偶奇
                {
                    if (JiOuType == '001' || JiOuType == '110') {
                        continue;
                    }
                }
                    break;
                case '001'://偶偶奇 杀奇奇偶
                {
                    if (JiOuType == '110' || JiOuType == '001') {
                        continue;
                    }
                }
                    break;
                case '101'://奇偶奇 杀偶奇偶
                {
                    if (JiOuType == '010' || JiOuType == '101') {
                        continue;
                    }
                }
                    break;
                case '010'://偶奇偶 杀奇偶奇
                {
                    if (JiOuType == '101' || JiOuType == '010') {
                        continue;
                    }
                }
                    break;
                case '100'://奇偶偶 杀偶奇奇
                {
                    if (JiOuType == '011' || JiOuType == '100') {
                        continue;
                    }
                }
                    break;
                case '011'://偶奇奇 杀奇偶偶
                {
                    if (JiOuType == '100' || JiOuType == '011') {
                        continue;
                    }
                }
                    break;
            }

            restNumberArray.push(item);
        }

        //日志记录杀号类型
        //let killJiouType_01 = lastPrizeNumberJiOuType;
        let killJiouType_02 = ((lastPrizeNumberJiOuType.substr(0, 1) == '1' ? 0 : 1) + '' + (lastPrizeNumberJiOuType.substr(1, 1) == '1' ? 0 : 1) + '' + (lastPrizeNumberJiOuType.substr(2, 1) == '1' ? 0 : 1));
        log.info('排除奇偶类型：%s', killJiouType_02);

        let ruleResult: CommonKillNumberResult = {
            killNumber: killJiouType_02 + " | " + lastPrizeNumberJiOuType,
            killNumberResult: restNumberArray
        };

        return Promise.resolve(ruleResult);
    }
}