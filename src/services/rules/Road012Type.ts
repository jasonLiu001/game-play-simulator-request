import {IRules} from "./IRules";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";
import {CONFIG_CONST} from "../../config/Config";
import {LotteryDbService} from "../dbservices/DBSerivice";
import {AwardInfo} from "../../models/db/AwardInfo";
import {RejectionMsg} from "../../models/EnumModel";

let log4js = require('log4js'),
    log = log4js.getLogger('Road012Type');

/**
 *
 * 杀012路
 * 杀倒数第一期012路--倒数第3期012路--倒数第4期012路
 */
export class Road012Type extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    private getNumber012Type(number: number): number {
        return number % 3;
    }

    public filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀012路中断提示：" + RejectionMsg.historyCountIsNotEnough);

                let restNumberArray: Array<string> = [];
                //上期开奖号码后三012路
                let baiWei012Type = this.getNumber012Type(Number(awardHistoryList[0].openNumber.substr(2, 1)));//百位012路类型
                let shiWei012Type = this.getNumber012Type(Number(awardHistoryList[0].openNumber.substr(3, 1)));//十位012路类型
                let geWei012Type = this.getNumber012Type(Number(awardHistoryList[0].openNumber.substr(4, 1)));//个位012路类型

                //倒数第2期012路
                let baiWei012Type_01 = this.getNumber012Type(Number(awardHistoryList[1].openNumber.substr(2, 1)));//百位012路类型
                let shiWei012Type_01 = this.getNumber012Type(Number(awardHistoryList[1].openNumber.substr(2, 1)));//十位012路类型
                let geWei012Type_01 = this.getNumber012Type(Number(awardHistoryList[1].openNumber.substr(2, 1)));//个位012路类型

                //倒数第3期012路
                let baiWei012Type_02 = this.getNumber012Type(Number(awardHistoryList[2].openNumber.substr(2, 1)));//百位012路类型
                let shiWei012Type_02 = this.getNumber012Type(Number(awardHistoryList[2].openNumber.substr(2, 1)));//十位012路类型
                let geWei012Type_02 = this.getNumber012Type(Number(awardHistoryList[2].openNumber.substr(2, 1)));//个位012路类型

                //需要杀掉的类型1
                let cur012Type_1 = baiWei012Type + '' + shiWei012Type + '' + geWei012Type;
                //需要杀掉的类型2
                let cur012Type_2 = baiWei012Type_01 + '' + shiWei012Type_01 + '' + geWei012Type_01;
                //需要杀掉的类型3
                let cur012Type_3 = baiWei012Type_02 + '' + shiWei012Type_02 + '' + geWei012Type_02;

                for (let i = 0; i < originNumberArray.length; i++) {
                    let item = originNumberArray[i];
                    //杀012路类型
                    let first012Type = this.getNumber012Type(Number(item.charAt(0)));
                    let second012Type = this.getNumber012Type(Number(item.charAt(1)));
                    let third012Type = this.getNumber012Type(Number(item.charAt(2)));
                    let cur012Type = first012Type + '' + second012Type + '' + third012Type;

                    if (cur012Type == cur012Type_1 || cur012Type == cur012Type_2 || cur012Type == cur012Type_3)continue;

                    restNumberArray.push(item);
                }

                log.info('排除012类型：%s,%s', cur012Type_1, cur012Type_2, cur012Type_3);

                let ruleResult: CommonKillNumberResult = {
                    killNumber: cur012Type_1 + '|' + cur012Type_2 + '|' + cur012Type_3,
                    killNumberResult: restNumberArray
                };

                return Promise.resolve(ruleResult);
            });
    }
}