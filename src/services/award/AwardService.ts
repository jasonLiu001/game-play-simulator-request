import {AwardInfo} from "../../models/db/AwardInfo";
import {TimeService} from "../time/TimeService";
import {Config} from "../../config/Config";
import {Award360Service} from "../crawler/award/Award360Service";
import {LotteryDbService} from "../dbservices/ORMService";
import {RejectionMsg} from "../../models/EnumModel";
import {AwardCaiBaXianService} from "../crawler/award/AwardCaiBaXianService";
import {ScheduleTaskList} from "../../config/ScheduleTaskList";
import moment  = require('moment');
import Promise = require('bluebird');
import cron = require('node-cron');
import {AwardKm28ComService} from "../crawler/award/AwardKm28ComService";

let log4js = require('log4js'),
    log = log4js.getLogger('AwardService'),
    awardCaiBaXianService = new AwardCaiBaXianService(),
    crawl360Service = new Award360Service(),
    awardKm28ComService: AwardKm28ComService = new AwardKm28ComService();

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
        ScheduleTaskList.awardFetchTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.awardFetchTaskEntity.cronTimeStr, () => {
            TimeService.isInvestTime()
                .then(() => {
                    log.info('获取第三方开奖数据');
                    return crawl360Service.getAwardInfo();
                })
                .then((award: AwardInfo) => {
                    return AwardService.saveOrUpdateAwardInfo(award);
                })
                .then(() => {
                    log.info('保存第三方开奖数据完成');
                    if (success) success();
                })
                .catch((err) => {
                    if (err) {
                        log.error(err);
                    }
                });
        });
    }

    /**
     *
     *
     * 获取开奖信息
     */
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<AwardInfo> {
        return LotteryDbService.getAwardInfo(award.period)
            .then((dbAwardRecord: any) => {
                if (dbAwardRecord) {//奖号未更新的情况
                    //如果当前时间大于开奖时间2分钟的情况下，还是没有更新奖号，则切换获取奖号的站点
                    let dateTimeNow = moment();
                    //当前时间和开奖时间时差
                    let minutesDiff = dateTimeNow.diff(moment(Config.globalVariable.nextPeriodInvestTime), 'minutes', true);
                    if (minutesDiff >= 1.5) {//相差1.5分钟 还是未开奖 则切换开奖源
                        log.info('开奖时间 %s 和 当前时间 %s 相差 %s 分钟 ，切换更新奖号数据源', moment(Config.globalVariable.nextPeriodInvestTime).format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), minutesDiff);
                        //切换更新奖号方式
                        return awardKm28ComService.getAwardInfo();
                    } else {
                        //开奖时间和当前时间相差1.5分钟以内 数据库中存在开奖记录，说明当前奖号还没有更新，不停获取直到更新为止
                        return Promise.reject(RejectionMsg.isExistRecordInAward);
                    }
                }
                return award;
            })
            .then((newAward: AwardInfo) => {
                //更新下期开奖时间
                TimeService.updateNextPeriodInvestTime();
                log.info('正在保存第三方开奖数据...');
                //更新全局变量
                Config.globalVariable.last_Period = newAward.period;
                Config.globalVariable.last_PrizeNumber = newAward.openNumber;
                Config.globalVariable.current_Peroid = TimeService.getCurrentPeriodNumber(new Date());

                return LotteryDbService.saveOrUpdateAwardInfo(newAward);
            });
    }
}
