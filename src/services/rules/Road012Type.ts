import {IRules} from "./IRules";
import {Config} from "../../config/Config";
import {AbstractRuleBase} from "./AbstractRuleBase";
import Promise = require('bluebird');
import {LotteryDbService} from "../dbservices/DBSerivice";

/**
 *
 * 杀012路
 */
export class Road012Type extends AbstractRuleBase implements IRules {
    private getNumber012Type(number: number): number {
        return number % 3;
    }

    public filterNumbers(config: Config, lotteryDbService: LotteryDbService): Promise<Array<string>> {
        let originNumberArray = this.getTotalNumberArray();
        let restNumberArray: Array<string> = [];
        let last_PrizeNumber = config.globalVariable.last_PrizeNumber;
        //开奖号码信息
        let prizeFirst = Number(last_PrizeNumber.charAt(0));
        let prizeSecond = Number(last_PrizeNumber.charAt(1));
        let prizeThird = Number(last_PrizeNumber.charAt(2));
        let prizeForth = Number(last_PrizeNumber.charAt(3));//5
        let prizeFifth = Number(last_PrizeNumber.charAt(4));

        //上期开奖号码后三012路
        let baiWei012Type = this.getNumber012Type(prizeThird);//百位012路类型
        let shiWei012Type = this.getNumber012Type(prizeForth);//十位012路类型
        let geWei012Type = this.getNumber012Type(prizeFifth);//个位012路类型
        let lastPrizeNumber012Type = baiWei012Type + '' + shiWei012Type + '' + geWei012Type;

        for (let i = 0; i < originNumberArray.length; i++) {
            let item = originNumberArray[i];
            //杀012路类型
            let first012Type = this.getNumber012Type(Number(item.charAt(0)));
            let second012Type = this.getNumber012Type(Number(item.charAt(1)));
            let third012Type = this.getNumber012Type(Number(item.charAt(2)));
            let cur012Type = first012Type + '' + second012Type + '' + third012Type;
            //需要杀掉的类型1
            let cur012Type_1 = geWei012Type + '' + baiWei012Type + '' + shiWei012Type;
            //需要杀掉的类型2
            let cur012Type_2 = shiWei012Type + '' + geWei012Type + '' + baiWei012Type;
            if (cur012Type == cur012Type_1 || cur012Type == cur012Type_2)continue;

            restNumberArray.push(item);
        }

        return Promise.resolve(restNumberArray);
    }
}