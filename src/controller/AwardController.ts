import {Request, Response} from 'express';
import moment  = require('moment');
import {AwardKm28ComService} from "../services/crawler/award/AwardKm28ComService";
import {AwardInfo} from "../models/db/AwardInfo";
import {ResponseJson} from "../models/ResponseJson";
import {AwardService} from "../services/award/AwardService";
import {ConstVars} from "../global/ConstVars";
import {TimeService} from "../services/time/TimeService";

let log4js = require('log4js'),
    log = log4js.getLogger('AwardController'),
    awardKm28ComService: AwardKm28ComService = new AwardKm28ComService();

export class AwardController {

    /**
     *
     * 【接口暂未使用】获取奖号列表
     */
    public getLatestAwardInfo(req: Request, res: Response) {
        let jsonRes: ResponseJson = new ResponseJson();
        let lastPeriodStr: string = TimeService.getLastPeriodNumber(new Date());
        awardKm28ComService.getAwardInfo()
            .then((award: AwardInfo) => {
                let successMsg: string = "获取" + lastPeriodStr + "期奖号成功";
                jsonRes.success(successMsg, award);
                log.info('%s 当前时间：%s', successMsg, moment().format(ConstVars.momentDateTimeFormatter));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "获取" + lastPeriodStr + "期奖号失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format(ConstVars.momentDateTimeFormatter), e.message);
                return res.status(200).send(jsonRes);
            });
    }

    /**
     *
     * 【接口暂未使用】更新奖号 这个方法只更新最新的开奖信息，没有根据期号来更新，不需要传递参数
     */
    public updateAward(req: Request, res: Response) {
        let jsonRes: ResponseJson = new ResponseJson();
        let lastAwardInfo: AwardInfo = null;
        let lastPeriodStr: string = TimeService.getLastPeriodNumber(new Date());
        awardKm28ComService.getAwardInfo()
            .then((newAward: AwardInfo) => {
                lastAwardInfo = newAward;
                if (lastPeriodStr != newAward.period) return Promise.reject(new Error(lastPeriodStr + '期开奖号码获取错误'));
            })
            .then(() => {
                return AwardService.saveOrUpdateAwardInfo(lastAwardInfo);
            })
            .then(() => {
                let successMsg: string = lastPeriodStr + "期奖号更新成功";
                jsonRes.success(successMsg, lastAwardInfo);
                log.info('%s 当前时间：%s', successMsg, moment().format(ConstVars.momentDateTimeFormatter));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = lastPeriodStr + "期奖号更新失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format(ConstVars.momentDateTimeFormatter), e.message);
                return res.status(200).send(jsonRes);
            });
    }
}

