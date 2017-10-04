import {AwardInfo} from "../../models/AwardInfo";
import Promise = require('bluebird');
import {TimerService} from "../timer/TimerService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {Award360Service} from "../crawler/award/Award360Service";
import {LotteryDbService} from "../dbservices/DBSerivice";

let log4js = require('log4js'),
    log = log4js.getLogger('AwardService'),
    timerService = new TimerService(),
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
    start(lotteryDbService: LotteryDbService, config: Config, success?: Function): void {
        Config.awardTimer = setInterval(() => {
            this.saveOrUpdateAwardInfo(lotteryDbService, config, success)
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
    saveOrUpdateAwardInfo(lotteryDbService: LotteryDbService, config: Config, success?: Function): Promise<AwardInfo> {
        return timerService.isInvestTime(config, new Date(), CONFIG_CONST.openTimeDelaySeconds)
            .then(() => {
                log.info('获取第三方开奖数据');
                return crawl360Service.getAwardInfo();
            })
            .then((award: AwardInfo) => {
                return lotteryDbService.getAwardInfo(award.period)
                    .then((dbAwardRecord) => {
                        if (dbAwardRecord) {
                            //数据库中存在开奖记录，说明当前奖号还没有更新，不停获取直到更新为止
                            return Promise.reject(config.rejectionMsg.isExistRecordInAward);
                        }
                        return dbAwardRecord;
                    })
                    .then(() => {
                        //更新下期开奖时间
                        timerService.updateNextPeriodInvestTime(config, new Date(), CONFIG_CONST.openTimeDelaySeconds);
                        log.info('正在保存第三方开奖数据...');
                        //更新全局变量
                        config.globalVariable.last_Period = award.period;
                        config.globalVariable.last_PrizeNumber = award.openNumber;
                        config.globalVariable.current_Peroid = timerService.getCurrentPeriodNumber(new Date());

                        return lotteryDbService.saveOrUpdateAwardInfo(award);
                    }).then(() => {
                        log.info('保存第三方开奖数据完成');
                        if (success) success(award);
                        return award;
                    });
            });
    }

    /**
     *
     *
     * 停止获取奖号
     */
    stop(): void {
        clearInterval(Config.awardTimer);
    }
}