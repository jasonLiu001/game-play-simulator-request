import {AwardInfo} from "../../../models/db/AwardInfo";
import {ConstVars} from "../../../global/ConstVars";
import {GameHistory, GameInfo, JiangNanLotteryService} from "../../platform/jiangnan/JiangNanLotteryService";
import Promise = require('bluebird');
import moment  = require('moment');


const Enumerable = require('linq');

let request = require('request'),
    log4js = require('log4js'),
    jiangNanLotteryService = new JiangNanLotteryService(),
    log = log4js.getLogger('AwardJiangNanPlatfromService');


export class AwardJiangNanPlatfromService {
    getAwardInfo(updateStatus: number = 1): Promise<AwardInfo> {
        return jiangNanLotteryService.getGameInfo(request)
            .then((gameInfo: GameInfo) => {
                if (gameInfo.history == null || gameInfo.history.length == 0) {
                    log.info("未查询到历史号码：history.length=%s", 0);
                    return null;
                }

                let lastedRecord: GameHistory = gameInfo.history[gameInfo.history.length - 1];

                let awardInfo: AwardInfo = {
                    period: lastedRecord.issueno,
                    openNumber: lastedRecord.nums.replace(/\s/g, ''),
                    openTime: moment().format(ConstVars.momentDateTimeFormatter),
                    createdTime: moment().format(ConstVars.momentDateTimeFormatter),
                    updateStatus: updateStatus//自动更新
                };

                return awardInfo;
            });
    }
}
