import {Request, Response} from "express";
import {InvestInfo} from "../models/db/InvestInfo";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {PlatformService} from "../services/platform/PlatformService";
import {ResponseJson} from "../models/ResponseJson";
import {TimeService} from "../services/time/TimeService";
import {GlobalRequest} from "../global/GlobalRequest";
import moment  = require('moment');
import {InvestBase} from "../services/invest/InvestBase";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestController'),
    investBase = new InvestBase();

class InvestControllerConfig {
    //已经投注的期号
    public static investPeriod: string = null;
}

export class InvestController {
    /**
     *
     * 根据计划执行一键投注
     */
    public manualInvest(req: Request, res: Response): any {
        let period: string = req.body.period;
        let planType: number = Number(req.body.planType);
        let awardMode: number = Number(req.body.awardMode);//投注模式
        let touZhuBeiShu: number = Number(req.body.touZhuBeiShu);//投注倍数
        let investTableName: string = req.body.investTableName;//投注的表名
        let investNumbers: string = req.body.investNumbers;//投注号码

        let jsonRes: ResponseJson = new ResponseJson();
        log.info('手动一键投注请求已收到，参数:period=%s,planType=%s,awardMode=%s,touZhuBeiShu=%s,investTableName=%s', period, planType, awardMode, touZhuBeiShu, investTableName);

        //当前能够投注的期号
        let currentPeriod: string = TimeService.getCurrentPeriodNumber(new Date());
        if (period != currentPeriod) {
            jsonRes.fail(period + "期已停止投注，投注失败");
            log.error("手动投注失败，%s期已停止投注，%s期可投注，当前时间：%s", period, currentPeriod, moment().format('YYYY-MM-DD HH:mm:ss'));
            return res.status(200).send(jsonRes);
        }

        if (InvestControllerConfig.investPeriod == period) {
            jsonRes.fail(period + "期已投注，勿重复投注");
            log.error("手动投注失败，%s期重复投注，%s期可投注，当前时间：%s", period, currentPeriod, moment().format('YYYY-MM-DD HH:mm:ss'));
            return res.status(200).send(jsonRes);
        }

        LotteryDbService.getInvestByTableName(investTableName, period, planType)
            .then((investInfo: InvestInfo) => {
                if (investInfo.status == 1) {
                    log.error("手动投注失败，%s期已完成，%s期可投注，不允许投注，当前时间：%s", period, currentPeriod, moment().format('YYYY-MM-DD HH:mm:ss'));
                    return Promise.reject(investInfo.period + "期已结束，投注失败");
                }
                investInfo.awardMode = awardMode;
                investInfo.touZhuBeiShu = touZhuBeiShu;
                investInfo.investNumbers = investNumbers;
                log.info("根据参数，调整倍数等信息，awardMode=%s,touZhuBeiShu=%s", investInfo.awardMode, investInfo.touZhuBeiShu);
                return PlatformService.loginAndInvest(GlobalRequest.request, investInfo);
            })
            .then(() => {
                let successMsg: string = period + "期，一键投注成功";
                jsonRes.success(successMsg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                //投注成功 更新已投注期号 防止重复投注
                InvestControllerConfig.investPeriod = period;
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = period + "期，一键投注失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'), e.message);
                return res.status(200).send(jsonRes);
            });
    }

    /**
     *
     * 一键撤销投注
     */
    public manualCancelInvest(req: Request, res: Response): any {
        let period: string = req.body.period;
        let jsonRes: ResponseJson = new ResponseJson();
        log.info('手动一键撤单请求已收到，参数:period=%s', period);

        PlatformService.cancelInvest(GlobalRequest.request, period)
            .then((msg) => {
                let successMsg: string = period + "期，一键撤单成功";
                jsonRes.success(successMsg + " " + msg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = period + "期，一键撤单失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'), e.message);
                return res.status(200).send(jsonRes);
            });
    }

    /**
     *
     * 手动更新盈利
     */
    public manualCalculateWinMoney(req: Request, res: Response): any {
        let jsonRes: ResponseJson = new ResponseJson();
        log.info('更新盈利请求已收到');
        investBase.calculateWinMoney()
            .then(() => {
                let successMsg: string = "盈利更新成功";
                jsonRes.success(successMsg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "盈利更新失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s，异常：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'), e.message);
                return res.status(200).send(jsonRes);
            })
    }
}
