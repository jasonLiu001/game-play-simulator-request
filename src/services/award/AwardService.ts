import {AwardInfo} from "../../models/db/AwardInfo";
import Promise = require('bluebird');
import {TimeService} from "../time/TimeService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {Award360Service} from "../crawler/award/Award360Service";
import {LotteryDbService} from "../dbservices/DBSerivice";
import {RejectionMsg} from "../../models/EnumModel";
import {AwardCaiBaXianService} from "../crawler/award/AwardCaiBaXianService";

let log4js = require('log4js'),
    log = log4js.getLogger('AwardService'),
    timeService = new TimeService(),
    awardCaiBaXianService = new AwardCaiBaXianService(),
    crawl360Service = new Award360Service();
/**
 *
 *
 * 奖号服务
 */
export class AwardService {
    /**
     *
     *
     * 开始获取奖号
     */
    public static startGetAwardInfoTask(success?: Function): void {
        Config.awardTimer = setInterval(() => {
            AwardService.saveOrUpdateAwardInfo(success)
                .catch((err) => {
                    if (err) {
                        log.error(err);
                    }
                });
        }, CONFIG_CONST.autoCheckTimerInterval)
    }

    /**
     *
     *
     * 获取开奖信息
     */
    public static saveOrUpdateAwardInfo(success?: Function): Promise<AwardInfo> {
        return timeService.isInvestTime(new Date(), CONFIG_CONST.openTimeDelaySeconds)
            .then(() => {
                log.info('获取第三方开奖数据');
                return Promise.all(
                    [
                        crawl360Service.getAwardInfo(),
                        awardCaiBaXianService.getAwardInfo()
                    ]);
            })
            .then((results: Array<AwardInfo>) => {
                //如果奖号未更新，则不停获取开奖信息
                let _360Result = results[0], caiBaXianResult = results[1];
                if (_360Result.period == Config.globalVariable.last_Period && caiBaXianResult.period == Config.globalVariable.last_Period) {
                    return Promise.reject(RejectionMsg.prizeNumberNotUpdated);//更新奖号和上期一致，说明奖号未更新
                } else if (_360Result.period > Config.globalVariable.last_Period) {
                    return _360Result;
                } else if (caiBaXianResult.period > Config.globalVariable.last_Period) {
                    return caiBaXianResult;
                } else {
                    return _360Result;
                }
            })
            .then((awardInfo: AwardInfo) => {
                //更新下期开奖时间
                timeService.updateNextPeriodInvestTime(new Date(), CONFIG_CONST.openTimeDelaySeconds);
                log.info('正在保存第三方开奖数据...');
                //更新全局变量
                Config.globalVariable.last_Period = awardInfo.period;
                Config.globalVariable.last_PrizeNumber = awardInfo.openNumber;
                Config.globalVariable.current_Peroid = timeService.getCurrentPeriodNumber(new Date());

                return LotteryDbService.saveOrUpdateAwardInfo(awardInfo);
            }).then((awardInfo: AwardInfo) => {
                log.info('保存第三方开奖数据完成');
                if (success) success(awardInfo);
                return awardInfo;
            });
    }
}