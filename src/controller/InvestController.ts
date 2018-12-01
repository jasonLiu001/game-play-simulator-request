import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {InvestBase} from "../services/invest/InvestBase";
import {InvestInfo} from "../models/db/InvestInfo";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {PlatformService} from "../services/platform/PlatformService";
import {DefaultRequest} from "../services/AppServices";
import {ResponseJson} from "../models/ResponseJson";
import {TimeService} from "../services/time/TimeService";

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
        let jsonRes: ResponseJson = new ResponseJson();

        //当前能够投注的期号
        let currentPeriod: string = TimeService.getCurrentPeriodNumber(new Date());
        if (period != currentPeriod) {
            jsonRes.fail(period + "期已停止投注，投注失败");
            return res.status(200).send(jsonRes);
        }

        if (InvestControllerConfig.investPeriod == period) {
            jsonRes.fail(period + "期已投注，勿重复投注");
            return res.status(200).send(jsonRes);
        }

        LotteryDbService.getInvestByTableName(investTableName, period, planType)
            .then((investInfo: InvestInfo) => {
                if (investInfo.status == 1) return Promise.reject(investInfo.period + "期已结束，投注失败");
                //根据参数更改投注信息
                investInfo.awardMode = awardMode;
                investInfo.touZhuBeiShu = touZhuBeiShu;
                investInfo.investNumbers = investNumbers;
                return PlatformService.loginAndInvest(DefaultRequest.request, investInfo);
            })
            .then(() => {
                let successMsg: string = period + "期，一键投注成功";
                jsonRes.success(successMsg);
                //投注成功 更新已投注期号 防止重复投注
                InvestControllerConfig.investPeriod = period;
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = period + "期，一键投注失败";
                jsonRes.fail(errMsg, e.message);
                return res.status(200).send(jsonRes);
            });
    }
}