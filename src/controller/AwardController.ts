import {Request, Response} from 'express';
import moment  = require('moment');
import {AwardKm28ComService} from "../services/crawler/award/AwardKm28ComService";
import {AwardInfo} from "../models/db/AwardInfo";
import {ResponseJson} from "../models/ResponseJson";
import {AwardService} from "../services/award/AwardService";

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
        awardKm28ComService.getAwardInfo()
            .then((award: AwardInfo) => {
                let successMsg: string = "获取最新奖号信息成功";
                jsonRes.success(successMsg, award);
                log.info('%s 当前时间：%s', successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "获取奖号失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'), e.message);
                return res.status(200).send(jsonRes);
            });
    }

    /**
     *
     * 【接口暂未使用】更新奖号 这个方法只更新最新的开奖信息，没有根据期号来更新
     */
    public updateAward(req: Request, res: Response) {
        let jsonRes: ResponseJson = new ResponseJson();
        awardKm28ComService.getAwardInfo()
            .then((award: AwardInfo) => {
                return AwardService.saveOrUpdateAwardInfo(award);
            })
            .then(() => {
                let successMsg: string = "奖号更新成功";
                jsonRes.success(successMsg);
                log.info('%s 当前时间：%s', successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "奖号更新失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'), e.message);
                return res.status(200).send(jsonRes);
            });
    }
}

