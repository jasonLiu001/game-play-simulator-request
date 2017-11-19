import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import _ = require('lodash');
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";
import {OpenNumber} from "../../models/OpenNumber";

let log4js = require('log4js'),
    log = log4js.getLogger('BrokenGroup125');


/**
 *
 *
 * 断组 1-2-5
 * 断组的依据号码产生：倒数第一期十位分别加6,5,1,2,7,3,9,8,4,0后的各自结果取和尾组成10位数
 * 断组号码：取10位数第一位（1断）--10位数后8位的前2位（2断）--10位数的后5位（3断）
 */
export class BrokenGroup125 extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    /**
     *
     * 产生断组号码 格式：5-78-91206
     */
    private getBrokenNumbers(): string {
        let brokenNumberStr = '';
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();
        let num = prizeNumber.shi;
        let baseNumber = (num + 6) % 10 + '' + (num + 5) % 10 + '' + (num + 1) % 10 + '' + (num + 2) % 10 + '' + (num + 7) % 10 + '' + num + '' + (num + 3) % 10 + '' + (num + 9) % 10 + '' + (num + 8) % 10 + '' + (num + 4) % 10;
        brokenNumberStr = baseNumber.substr(0, 1) + '-' + baseNumber.substr(2, 2) + '-' + baseNumber.substr(5, 5);
        return brokenNumberStr;
    }

    /**
     *
     *
     * @param {String} brokenGroupStr 产生的断组字符串  如：5-78-91206
     * @return 返回数组 比如：[0,1]
     */
    private getNumbersNotInGroup(brokenGroupStr: string): Array<string> {
        let numbersNotIn = [];
        let brokenNumberStr = brokenGroupStr.split('-').join(',');
        for (let i = 0; i < 10; i++) {
            if (brokenNumberStr.indexOf(String(i)) == -1) {
                numbersNotIn.push(i);
            }
        }
        return numbersNotIn;
    }

    /**
     *
     *
     * 根据传入的参数生成号码数组 如：参数为[0,1]，生成的最终数组为['000', '100', '010', '001', '110', '101', '011', '111']
     */
    private getArray(numbers: Array<string>): Array<string> {
        let numberArray = [];
        for (let key1 in numbers) {
            for (let key2 in numbers) {
                for (let key3 in numbers) {
                    numberArray.push(numbers[key1] + '' + numbers[key2] + '' + numbers[key3]);
                }
            }
        }
        return numberArray;
    }

    /**
     *
     *
     * @param {String} brokenGroupStr 产生的断组字符串  如：5-78-91206
     * @param {Number} count 断组个数，如：count=1，则结果为5-78-91206=1中选择的号码
     */
    private getBrokenGroupNumberArray(brokenGroupStr: string, count: number): Array<string> {
        let resultArray = [];
        let brokenStrArray = brokenGroupStr.split('-');
        let brokenStr01: any = brokenStrArray[0];
        let brokenStr02: any = brokenStrArray[1];
        let brokenStr03: any = brokenStrArray[2];
        switch (count) {
            case 0://号码不会出现在断组号码中
                break;
            case 1://号码在在3断中1断  出1个号码
                break;
            case 2://号码在3断中2断  各出1个号码
                break;
            case 3://号码在3断中3断 各出1个号码
            {
                for (let n1 in brokenStr01) {
                    for (let n2 in brokenStr02) {
                        for (let n3 in brokenStr03) {
                            resultArray.push(brokenStr01[n1] + '' + brokenStr02[n2] + '' + brokenStr03[n3]);
                        }
                    }
                }
                for (let n1 in brokenStr01) {
                    for (let n2 in brokenStr03) {
                        for (let n3 in brokenStr02) {
                            resultArray.push(brokenStr01[n1] + '' + brokenStr03[n2] + '' + brokenStr02[n3]);
                        }
                    }
                }
                for (let n1 in brokenStr02) {
                    for (let n2 in brokenStr01) {
                        for (let n3 in brokenStr03) {
                            resultArray.push(brokenStr02[n1] + '' + brokenStr01[n2] + '' + brokenStr03[n3]);
                        }
                    }
                }
                for (let n1 in brokenStr02) {
                    for (let n2 in brokenStr03) {
                        for (let n3 in brokenStr01) {
                            resultArray.push(brokenStr02[n1] + '' + brokenStr03[n2] + '' + brokenStr01[n3]);
                        }
                    }
                }
                for (let n1 in brokenStr03) {
                    for (let n2 in brokenStr02) {
                        for (let n3 in brokenStr01) {
                            resultArray.push(brokenStr03[n1] + '' + brokenStr02[n2] + '' + brokenStr01[n3]);
                        }
                    }
                }
                for (let n1 in brokenStr03) {
                    for (let n2 in brokenStr01) {
                        for (let n3 in brokenStr02) {
                            resultArray.push(brokenStr03[n1] + '' + brokenStr01[n2] + '' + brokenStr02[n3]);
                        }
                    }
                }
            }
                break;
        }


        return resultArray;
    }

    filterNumbers(): Promise<CommonKillNumberResult> {
        let totalNumberArray = this.getTotalNumberArray();
        //产生断组号码
        let brokenGroupStr = this.getBrokenNumbers();

        //断组中不包含的号码
        let numberNotInGroup = this.getNumbersNotInGroup(brokenGroupStr);
        //01.首先排除掉 断组中不包含的号码 如'5-78-91206'不包含'3'，所以首先排除掉由'3'组成的所有三位号码
        let arrayNotBuy = this.getArray(numberNotInGroup);
        //剩余的号码
        let restNumbers = this.getAvailableNumbers(totalNumberArray, arrayNotBuy);

        //02.排除掉3断都同时有的情况 如'5-78-91206'，3断同时有即类似，579,715,589等这样的号码要被干掉
        let filterNumbers = this.getBrokenGroupNumberArray(brokenGroupStr, 3);
        let resultNumbers = this.getAvailableNumbers(restNumbers, filterNumbers);

        log.info('断组号码1-2-5：%s', brokenGroupStr);

        let ruleResult: CommonKillNumberResult = {
            killNumber: brokenGroupStr,
            killNumberResult: resultNumbers
        };

        return Promise.resolve(ruleResult);
    }
}