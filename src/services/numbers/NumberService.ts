import {JiOuType} from "../rules/JiOuType";
import {Road012Type} from "../rules/Road012Type";
import {KillNumbersFollowPlay} from "../rules/killnumber/KillNumbersFollowPlay";
import {BraveNumbers} from "../rules/BraveNumbers";
import {Config} from "../../config/Config";
import {AbstractRuleBase} from "../rules/AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {BrokenGroup} from "../rules/BrokenGroup";
import {KillNumbersMaxMiss} from "../rules/killnumber/KillNumbersMaxMiss";
import {KillNumberGeWei} from "../rules/killnumber/KillNumberGeWei";
import {KillNumberLastOpenNumber} from "../rules/killnumber/KillNumberLastOpenNumber";
import {KillNumberLastThreeOpenNumbers} from "../rules/killnumber/KillNumberLastThreeOpenNumbers";


let log4js = require('log4js'),
    log = log4js.getLogger('NumberService'),
    jiouType = new JiOuType(),
    road012Type = new Road012Type(),
    killNumbersFollowPlay = new KillNumbersFollowPlay(),
    killNumbersMaxMiss = new KillNumbersMaxMiss(),
    braveNumber = new BraveNumbers(),
    killNumberGeWei = new KillNumberGeWei(),
    killNumberLastOpenNumber = new KillNumberLastOpenNumber(),
    killNumberLastThreeOpenNumbers = new KillNumberLastThreeOpenNumbers(),
    brokenGroup = new BrokenGroup();
export class NumberService extends AbstractRuleBase {
    public generateInvestNumber(): Promise<string> {
        return Promise
            .all([
                jiouType.filterNumbers(), //杀奇偶
                killNumbersFollowPlay.filterNumbers(),//根据计划杀号 杀 百位 个位 十位
                //road012Type.filterNumbers(), //杀012路
                //killNumbersMaxMiss.filterNumbers(),//根据最大遗漏值 杀 百位 个位 十位
                //killNumberGeWei.filterNumbers(),//个位出现连号时 杀个位
                //killNumberLastOpenNumber.filterNumbers(),//上期出现什么号码，杀什么号码
                //killNumberLastThreeOpenNumbers.filterNumbers(),//上三期出现什么号码，杀每位的上3期号码
                //brokenGroup.filterNumbers() //断组
                //braveNumber.filterNumbers() //定胆
            ])
            .then((results) => {
                let resultArray = _.intersection(results[0], results[1]);
                return resultArray.join(',');
            });
    }

    /**
     *
     * 检查上期开奖号码是否满足投注条件
     */
    public isLastPrizeNumberValid(): boolean {
        let last_PrizeNumber = Config.globalVariable.last_PrizeNumber;
        //开奖号码信息
        let prizeFirst = Number(last_PrizeNumber.charAt(0));
        let prizeSecond = Number(last_PrizeNumber.charAt(1));
        let prizeThird = Number(last_PrizeNumber.charAt(2));
        let prizeForth = Number(last_PrizeNumber.charAt(3));//5
        let prizeFifth = Number(last_PrizeNumber.charAt(4));

        //上期开奖号码后三奇偶 倒杀
        let baiWeiJiOuType = this.getJiEouType(prizeThird);//百位奇偶类型
        let shiWeiJiOuType = this.getJiEouType(prizeForth);//十位奇偶类型
        let geWeiJiOuType = this.getJiEouType(prizeFifth);//个位奇偶类型
        //上期号码的奇偶类型
        let lastPrizeNumberJiOuType = baiWeiJiOuType + '' + shiWeiJiOuType + '' + geWeiJiOuType;
        if (lastPrizeNumberJiOuType == '001') {//偶偶奇 时投注
            log.info('当前开奖号码【%s】，满足【偶偶奇】', last_PrizeNumber);
            return true;
        }
        log.info('当前开奖号码【%s】，不满足【偶偶奇】，放弃投注', last_PrizeNumber);
        return false;
    }
}