import Promise = require('bluebird');
import {Config} from "../config/Config";

/**
 *
 *
 * 工具类
 */
export class Utility {
    /**
     *
     *
     * 获取开奖号码 后二，后三，后一
     */
    public static getPrizeNumber(config: Config, openNumber: string): string {
        //开奖号码
        let prizeNumber = '';
        switch (config.currentSelectedPlayMode) {
            case config.playMode.three:
                prizeNumber = openNumber.substring(2);
                break;
            case config.playMode.two:
                prizeNumber = openNumber.substring(3);
                break;
            case config.playMode.one:
                prizeNumber = openNumber.substring(4);
                break;
            default:
                prizeNumber = openNumber.substring(2);
                break;
        }
        return prizeNumber;
    }
}