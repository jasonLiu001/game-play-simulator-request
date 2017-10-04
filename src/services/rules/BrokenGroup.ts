import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import {Config} from "../../config/Config";
import _ = require('lodash');
import Promise = require('bluebird');
import {LotteryDbService} from "../dbservices/DBSerivice";

/**
 *
 * 断组
 */
export class BrokenGroup extends AbstractRuleBase implements IRules {
    /**
     *
     * 产生断组号码 格式：019-456-2378
     */
    private getBrokenNumbers(config: Config): string {
        let brokenNumberStr = '';
        let lastPrize = config.globalVariable.last_PrizeNumber;
        let num1 = lastPrize.substr(3, 1);
        let num2 = lastPrize.substr(4, 1);
        let tailNumber = (Number(num1) + Number(num2)) % 10;
        switch (tailNumber) {
            case 0:
            case 5:
                brokenNumberStr = '019-456-2378';
                break;
            case 1:
            case 6:
                brokenNumberStr = '012-567-3489';
                break;
            case 2:
            case 7:
                brokenNumberStr = '123-678-0459';
                break;
            case 3:
            case 8:
                brokenNumberStr = '234-789-0156';
                break;
            case 4:
            case 9:
                brokenNumberStr = '089-345-1267';
        }


        return brokenNumberStr;
    }

    /**
     *
     *
     * @param {String} brokenGroupStr 产生的断组字符串  如：9-456-2378
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
        for (let item1 in numbers) {
            for (let item2 in numbers) {
                for (let item3 in numbers) {
                    numberArray.push(item1 + '' + item2 + '' + item3);
                }
            }
        }
        return numberArray;
    }

    /**
     *
     *
     * @param {String} brokenGroupStr 产生的断组字符串  如：9-456-2378
     * @param {Number} count 断组个数，如：count=1，则结果为9-456-2378=1中选择的号码
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

    filterNumbers(config: Config, lotteryDbService: LotteryDbService): Promise<Array<string>> {
        let totalNumberArray = this.getTotalNumberArray();
        //产生断组号码
        let brokenGroupStr = this.getBrokenNumbers(config);
        //断组中不包含的号码
        let numberNotInGroup = this.getNumbersNotInGroup(brokenGroupStr);
        //01.首先排除掉 断组中不包含的号码 如'9-456-2378'不包含'01'，所以首先排除掉由'01'组成的所有三位号码
        let arrayNotBuy = this.getArray(numberNotInGroup);
        //剩余的号码
        let restNumbers = this.getAvailableNumbers(totalNumberArray, arrayNotBuy);

        //02.排除掉3断都同时有的情况 如'9-456-2378'，3断同时有即类似，942,943,952等这样的号码要被干掉
        let filterNumbers = this.getBrokenGroupNumberArray(brokenGroupStr, 3);
        let resultNumbers = this.getAvailableNumbers(restNumbers, filterNumbers);
        return Promise.resolve(resultNumbers);
    }
}