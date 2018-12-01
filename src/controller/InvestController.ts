import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {InvestInfo} from "../models/db/InvestInfo";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {PlatformService} from "../services/platform/PlatformService";
import {DefaultRequest} from "../services/AppServices";
import {ResponseJson} from "../models/ResponseJson";
import {TimeService} from "../services/time/TimeService";
import {CONFIG_CONST} from "../config/Config";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestController');

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

        //记录当前设置中的元角分模式 投注成功或者失败后 恢复到当前状态
        let configAwardMode: number = CONFIG_CONST.awardMode;

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
                //根据参数更改投注信息
                CONFIG_CONST.awardMode = awardMode;//同时修改设置中的awardMode，异常或者成功需要恢复
                log.info('手动投注模式值更改为 %s', CONFIG_CONST.awardMode);
                investInfo.awardMode = awardMode;
                investInfo.touZhuBeiShu = touZhuBeiShu;
                investInfo.investNumbers = investNumbers;
                log.info("根据参数，调整倍数等信息，awardMode=%s,touZhuBeiShu=%s", investInfo.awardMode, investInfo.touZhuBeiShu);
                return PlatformService.loginAndInvest(DefaultRequest.request, investInfo);
            })
            .then(() => {
                let successMsg: string = period + "期，一键投注成功";
                jsonRes.success(successMsg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                //投注成功 更新已投注期号 防止重复投注
                InvestControllerConfig.investPeriod = period;
                //恢复设置中投注模式
                CONFIG_CONST.awardMode = configAwardMode;
                log.info('手动投注结束，投注模式值恢复为 %s', CONFIG_CONST.awardMode);
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = period + "期，一键投注失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                //恢复设置中投注模式
                CONFIG_CONST.awardMode = configAwardMode;
                log.info('手动投注结束，投注模式值恢复为 %s', CONFIG_CONST.awardMode);
                return res.status(200).send(jsonRes);
            });
    }
}