import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import Promise = require('bluebird');
import {RejectionMsg} from "../../../models/EnumModel";
import _ = require('lodash');
import {KillNumberInfo} from "./KillNumbersFollowPlay";
import {CommonKillNumberResult} from "../../../models/RuleResult";
import {OpenNumber} from "../../../models/OpenNumber";
import {CONFIG_CONST} from "../../../config/Config";
import {LotteryDbService} from "../../dbservices/ORMService";
import {AwardInfo} from "../../../models/db/AwardInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('KillNumberRandom');

export class KillNumberRandom extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    /**
     *
     * 根据传递的号码产生杀号号码
     * @param {Number} num
     * @returns {Array<Number>}
     */
    private getKillNumberArray(num: string): Array<string> {
        if (num == '0') {
            return ['9', '0', '1'];
        } else if (num == '9') {
            return ['8', '9', '0'];
        } else {
            return [String(Number(num) - 1), num, String(Number(num) + 1)];
        }
    }

    /**
     *
     * 可以杀掉的号码
     * @returns {Bluebird<KillNumberInfo>}
     */
    private getKillNumberInfo(): Promise<KillNumberInfo> {
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();

        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀跨提示：" + RejectionMsg.historyCountIsNotEnough);

                //倒数第二期 开奖号码
                let last_02 = awardHistoryList[1].openNumber;
                let last_bai = Number(last_02.substr(2, 1));
                let last_shi = Number(last_02.substr(3, 1));
                let last_ge = Number(last_02.substr(4, 1));

                //开奖号码
                let prizeNumber: OpenNumber = this.getPrizeNumberObj();
                let bai = prizeNumber.bai;
                let shi = prizeNumber.shi;
                let ge = prizeNumber.ge;
                let killNumberInfo: KillNumberInfo = new KillNumberInfo();

                //上上期百位==上期十位
                if (last_bai == shi) {
                    //本期杀十位 号码取上期百位
                    killNumberInfo.dropShiWeiNumberArray = this.getKillNumberArray(String(bai));
                } else if (last_bai == ge) {
                    killNumberInfo.dropGeWeiNumberArray = this.getKillNumberArray(String(bai));
                } else if (last_shi == bai) {
                    killNumberInfo.dropBaiWeiNumberArray = this.getKillNumberArray(String(shi));
                } else if (last_shi == ge) {
                    killNumberInfo.dropGeWeiNumberArray = this.getKillNumberArray(String(shi));
                } else if (last_ge == bai) {
                    killNumberInfo.dropBaiWeiNumberArray = this.getKillNumberArray(String(ge));
                } else if (last_ge == shi) {
                    killNumberInfo.dropShiWeiNumberArray = this.getKillNumberArray(String(ge));
                }

                return Promise.resolve(killNumberInfo);
            });


    }

    filterNumbers(): Promise<CommonKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();

        return this.getKillNumberInfo()
            .then((killNumberInfo: KillNumberInfo) => {
                let restNumberArray = [];
                let restArray = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray, killNumberInfo.dropShiWeiNumberArray, killNumberInfo.dropGeWeiNumberArray);
                //3位胆
                let prizeFirst = '';
                let prizeSecond = '';
                let prizeThird = '';

                if (killNumberInfo.dropBaiWeiNumberArray != null) {
                    prizeFirst = killNumberInfo.dropBaiWeiNumberArray[0];
                    prizeSecond = killNumberInfo.dropBaiWeiNumberArray[1];
                    prizeThird = killNumberInfo.dropBaiWeiNumberArray[2];
                } else if (killNumberInfo.dropShiWeiNumberArray != null) {
                    prizeFirst = killNumberInfo.dropShiWeiNumberArray[0];
                    prizeSecond = killNumberInfo.dropShiWeiNumberArray[1];
                    prizeThird = killNumberInfo.dropShiWeiNumberArray[2];
                } else if (killNumberInfo.dropGeWeiNumberArray != null) {
                    prizeFirst = killNumberInfo.dropGeWeiNumberArray[0];
                    prizeSecond = killNumberInfo.dropGeWeiNumberArray[1];
                    prizeThird = killNumberInfo.dropGeWeiNumberArray[2];
                }

                for (let i = 0; i < restArray.length; i++) {
                    let item = restArray[i];
                    if (item.indexOf(prizeFirst) > -1 || item.indexOf(prizeSecond) > -1 || item.indexOf(prizeThird) > -1) {
                        restNumberArray.push(item);
                    }
                }

                let result: CommonKillNumberResult = {
                    killNumber: '',
                    killNumberResult: restNumberArray
                };

                return result;
            });
    }
}