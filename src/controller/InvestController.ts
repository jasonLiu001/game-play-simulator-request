import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {InvestBase} from "../services/invest/InvestBase";
import {InvestInfo} from "../models/db/InvestInfo";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {PlatformService} from "../services/platform/PlatformService";
import {DefaultRequest} from "../services/AppServices";
import {ResponseJson} from "../models/ResponseJson";

let investBase = new InvestBase(),
    log4js = require('log4js'),
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
    public execute(req: Request, res: Response): any {
        let period: string = req.body.period;
        let planType: number = req.body.planType;
        let awardMode: number = req.body.awardMode;//投注模式
        let touZhuBeiShu: number = req.body.touZhuBeiShu;//投注倍数
        let investTableName: string = req.body.investTableName;//投注的表名

        if (InvestControllerConfig.investPeriod == period) {
            let jsonRes: ResponseJson = new ResponseJson();
            jsonRes.fail(period + "期已投注，勿重复投注");
            return res.status(200).send(jsonRes);
        }

        LotteryDbService.getInvestByTableName(investTableName, period, planType)
            .then((investInfo: InvestInfo) => {
                //根据参数更改投注信息
                investInfo.awardMode = awardMode;
                investInfo.touZhuBeiShu = touZhuBeiShu;
                return PlatformService.loginAndInvest(DefaultRequest.request, investInfo);
            })
            .then(() => {
                let successMsg: string = period + "期，一键投注成功";
                let jsonRes: ResponseJson = new ResponseJson();
                jsonRes.success(successMsg);
                //投注成功 更新已投注期号 防止重复投注
                InvestControllerConfig.investPeriod = period;
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = period + "期，一键投注失败";
                let jsonRes: ResponseJson = new ResponseJson();
                jsonRes.fail(errMsg, e.message);
                return res.status(200).send(jsonRes);
            });
    }
}