import {AwardInfo} from "../../models/db/AwardInfo";
import {TimeServiceV2} from "../time/TimeServiceV2";
import {Config} from "../../config/Config";
import {Award360Service} from "../crawler/award/Award360Service";
import {RejectionMsg} from "../../models/EnumModel";
import {AwardCaiBaXianService} from "../crawler/award/AwardCaiBaXianService";
import {ScheduleTaskList} from "../../config/ScheduleTaskList";
import {AwardKm28ComService} from "../crawler/award/AwardKm28ComService";
import {Award500comService} from "../crawler/historyawards/Award500comService";
import {ConstVars} from "../../global/ConstVars";
import {AwardTableService} from "../dbservices/services/AwardTableService";
import moment  = require('moment');
import Promise = require('bluebird');
import cron = require('node-cron');

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
    static startGetAwardInfoTask(success?: Function): void {
        ScheduleTaskList.awardFetchTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.awardFetchTaskEntity.cronTimeStr, () => {
            let newAwardInfo: AwardInfo = null;
            TimeServiceV2.isInvestTime()
                .then(() => {
                    log.info('获取第三方开奖数据');
                    return Award500comService.getHistoryAwardByDate(moment().format(ConstVars.momentDateFormatter))
                        .then((historyAwards: Array<AwardInfo>) => {
                            return historyAwards.length > 0 ? historyAwards[0] : null;
                        });
                    //暂时不用360的开奖源
                    //return crawl360Service.getAwardInfo();
                })
                .then((award: AwardInfo) => {
                    newAwardInfo = award;//保存最新开奖号码
                    return award != null ? AwardTableService.getAwardInfo(award.period) : Promise.reject(RejectionMsg.prizeNumberNotUpdated);
                })
                .then((dbAwardRecord: any) => {
                    //数据库中存在开奖记录，说明当前奖号还没有更新，不停获取直到更新为止
                    if (dbAwardRecord) return Promise.reject(RejectionMsg.isExistRecordInAward);
                })
                .then(() => {
                    let lastPeriodStr: string = TimeServiceV2.getLastPeriodNumber(new Date());
                    //保存奖号前需要进行奖号检查
                    if (lastPeriodStr == newAwardInfo.period) {
                        log.info('从网络获取的期号为：%s，正确的期号应该是：%s，两者一致，该奖号可保存！', newAwardInfo.period, lastPeriodStr);
                        //有新的奖号出现，则更新开奖信息
                        if (newAwardInfo) return AwardService.saveOrUpdateAwardInfo(newAwardInfo);
                    } else {
                        return Promise.reject('从网络获取的期号为：' + newAwardInfo.period + '，正确的期号应该是：' + lastPeriodStr + '，两者不一致，放弃保存该奖号！');
                    }
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
    static saveOrUpdateAwardInfo(award: AwardInfo): Promise<any> {
        log.info('正在保存第三方开奖数据...');
        //更新全局变量
        Config.globalVariable.last_Period = award.period;
        Config.globalVariable.last_PrizeNumber = award.openNumber;
        Config.globalVariable.current_Peroid = TimeServiceV2.getCurrentPeriodNumber(new Date());

        return AwardTableService.saveOrUpdateAwardInfo(award)
            .then((awardInfo: AwardInfo) => {
                //更新下期开奖时间
                TimeServiceV2.updateNextPeriodInvestTime();
                return awardInfo;
            });
    }

    /**
     *
     * 保存历史开奖号码到数据库
     */
    static saveOrUpdateHistoryAwardByDate(periodDate: string): Promise<any> {
        return Award500comService.getHistoryAwardByDate(periodDate)
            .then((historyAwards: Array<AwardInfo>) => {
                return AwardTableService.saveOrUpdateAwardInfoList(historyAwards);
            })
    }
}
