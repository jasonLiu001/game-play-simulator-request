import _ = require('lodash');
import {OpenNumber} from "../../models/OpenNumber";
import {Config} from "../../config/Config";

/**
 *
 *
 * 规则基类
 */
export class AbstractRuleBase {
    /**
     *
     *
     * 产生三星1000注原始号码 返回号码数组
     */
    getTotalNumberArray(): Array<string> {
        let a = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            c = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let totalArray = [];
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                for (let k = 0; k < c.length; k++) {
                    totalArray.push(a[i] + '' + b[j] + '' + c[k]);
                }
            }
        }
        return totalArray;
    }

    /**
     *
     *
     * 获取开奖号码对象
     */
    protected getPrizeNumberObj(): OpenNumber {
        let last_PrizeNumber = Config.globalVariable.last_PrizeNumber;
        //开奖号码信息
        let openNumber: OpenNumber = {
            wan: Number(last_PrizeNumber.charAt(0)),
            qian: Number(last_PrizeNumber.charAt(1)),
            bai: Number(last_PrizeNumber.charAt(2)),
            shi: Number(last_PrizeNumber.charAt(3)),
            ge: Number(last_PrizeNumber.charAt(4)),
            prizeString: last_PrizeNumber
        };
        return openNumber;
    }

    /**
     *
     * 判断当前数的奇偶类型
     * @param number
     * @return {number}
     */
    protected getJiEouType(number: number): number {
        return number % 2;
    }

    /**
     *
     * 从指定的号码中排除指定的号码数组并返回排除后的数组
     */
    protected getAvailableNumbers(originalArray: Array<string>, excludeArray: Array<string>): Array<string> {
        return _.difference(originalArray, excludeArray);
    }

    /**
     *
     * 取多个数组号码的交集
     */
    protected extractSameNumber(...arrays: Array<string>[]): Array<string> {
        return _.intersection(...arrays);
    }

    /**
     *
     *  使用该方法时，一定要注意百，十，个参数的顺序问题，没有就传null
     * 杀号 并返回杀号后的数组
     */
    protected getRestKillNumberArray(originNumberArray: Array<string>, dropBaiWeiNumberArray: Array<string>, dropShiWeiNumberArray: Array<string>, dropGeWeiNumberArray: Array<string>): Array<string> {
        let restNumberArray: Array<string> = [];
        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            //杀百位
            if (dropBaiWeiNumberArray != null && dropBaiWeiNumberArray != undefined) {
                let killItem = dropBaiWeiNumberArray[0];
                let baiWeiNumber: any = item.charAt(0);
                if (typeof killItem == 'number') {
                    baiWeiNumber = Number(baiWeiNumber);
                }
                let containIndex = _.indexOf(dropBaiWeiNumberArray, baiWeiNumber);
                let isContain: boolean = containIndex > -1;
                if (isContain) continue;
            }
            //杀十位
            if (dropShiWeiNumberArray != null && dropShiWeiNumberArray != undefined) {
                let killItem = dropShiWeiNumberArray[0];
                let shiWeiNumber: any = item.charAt(1);
                if (typeof killItem == 'number') {
                    shiWeiNumber = Number(shiWeiNumber);
                }
                let containIndex = _.indexOf(dropShiWeiNumberArray, shiWeiNumber);
                let isContain: boolean = containIndex > -1;
                if (isContain) continue;
            }
            //杀个位
            if (dropGeWeiNumberArray != null && dropGeWeiNumberArray != undefined) {
                let killItem = dropGeWeiNumberArray[0];
                let geWeiNumber: any = item.charAt(2);
                if (typeof killItem == 'number') {
                    geWeiNumber = Number(geWeiNumber);
                }
                let containIndex = _.indexOf(dropGeWeiNumberArray, geWeiNumber);
                let isContain: boolean = containIndex > -1;
                if (isContain) continue;
            }

            restNumberArray.push(item);
        }

        return restNumberArray;
    }

    /**
     *
     * 获取期号中指定位置的字符
     * @param periodString 期号字符串 格式：20170107-031
     * @param positionIndex 位置索引 0或者1
     */
    protected getPeriodPartString(periodString: string, positionIndex: number): string {
        let periodArray: Array<string> = periodString.split('-');
        if (periodArray.length != 2) return null;
        return periodArray[positionIndex];
    }
}