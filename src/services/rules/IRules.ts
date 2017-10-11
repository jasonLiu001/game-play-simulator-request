import {Config} from "../../config/Config";
import Promise = require('bluebird');
import {LotteryDbService} from "../dbservices/DBSerivice";

/**
 *
 * 杀号规则接口类
 */
export interface IRules {
    /**
     *
     * 杀号后剩余的号码
     * @param last_PrizeNumber 上期的开奖号码
     * @return 杀号后的数组
     */
    filterNumbers(): Promise<Array<string>>;
}