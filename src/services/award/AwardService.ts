import {AwardInfo} from "../../models/db/AwardInfo";
import Promise = require('bluebird');
import {TimeService} from "../time/TimeService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {Award360Service} from "../crawler/award/Award360Service";
import {LotteryDbService} from "../dbservices/ORMService";
import {RejectionMsg} from "../../models/EnumModel";
import {AwardCaiBaXianService} from "../crawler/award/AwardCaiBaXianService";

let log4js = require('log4js'),
    log = log4js.getLogger('AwardService'),
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
            AwardService.saveOrUpdateAwardInfo()
                .then(() => {
                    log.info('保存第三方开奖数据完成');
                    if (success) success();
                })
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
    public static saveOrUpdateAwardInfo(): Promise<AwardInfo> {
        let savedAwardInfo: AwardInfo = null;
        return TimeService.isInvestTime()
            .then(() => {
                log.info('获取第三方开奖数据');
                return crawl360Service.getAwardInfo();
            })
            .then((award: AwardInfo) => {
                savedAwardInfo = award;//保存awardinfo信息
                return LotteryDbService.getAwardInfo(award.period);
            })
            .then((dbAwardRecord: any) => {
                if (dbAwardRecord) {
                    //数据库中存在开奖记录，说明当前奖号还没有更新，不停获取直到更新为止
                    return Promise.reject(RejectionMsg.isExistRecordInAward);
                }
                return dbAwardRecord;
            })
            .then(() => {
                //更新下期开奖时间
                TimeService.updateNextPeriodInvestTime();
                log.info('正在保存第三方开奖数据...');
                //更新全局变量
                Config.globalVariable.last_Period = savedAwardInfo.period;
                Config.globalVariable.last_PrizeNumber = savedAwardInfo.openNumber;
                Config.globalVariable.current_Peroid = TimeService.getCurrentPeriodNumber(new Date());

                return LotteryDbService.saveOrUpdateAwardInfo(savedAwardInfo);
            });
    }
}