import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {InvestBase} from "../services/invest/InvestBase";
import {CONST_INVEST_TABLE} from "../models/db/CONST_INVEST_TABLE";
import {InvestInfo} from "../models/db/InvestInfo";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {Config, CONFIG_CONST} from "../config/Config";
import {TimeService} from "../services/time/TimeService";
import {PlatformService} from "../services/platform/PlatformService";
import {ErrorService} from "../services/ErrorService";
import {DefaultRequest} from "../services/AppServices";
import {ResponseJson} from "../models/ResponseJson";

let investBase = new InvestBase(),
    log4js = require('log4js'),
    log = log4js.getLogger('InvestController');

export class InvestController {
    /**
     *
     * 执行投注
     */
    public execute(req: Request, res: Response) {
        investBase.initAllPlanInvestInfo(CONST_INVEST_TABLE.tableName)
            .then((allPlanInvestInfo: Array<InvestInfo>) => {
                log.info('%s表 手动一键投注记录已保存', CONST_INVEST_TABLE.tableName);
                //保存投注记录
                return LotteryDbService.saveOrUpdateInvestInfoList(allPlanInvestInfo);
            })
            .then(() => {
                //表invest第一次初始化完毕 重置标识
                if (Config.isInvestTableInitCompleted) Config.isInvestTableInitCompleted = false;
                //当前期号
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                return LotteryDbService.getInvestInfo(currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
            })
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.reject("购买失败！" + CONST_INVEST_TABLE.tableName + "表中未查询到可投注数据");
                //不管是模拟投注还是真实投注，当前的真实投注值都应该增加，此值可用于判断已经投注的次数
                Config.currentInvestTotalCount++;
                return PlatformService.loginAndInvest(DefaultRequest.request, investInfo);
            })
            .then(() => {
                let message: string = "手动一键投注成功！当前时间：" + moment().format('YYYY-MM-DD HH:mm:ss');
                log.info(message);
                let successJson: ResponseJson = new ResponseJson();
                successJson.success(message);
                return res.status(200).send(successJson);
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
                let resJson: ResponseJson = new ResponseJson();
                resJson.fail(e.message);
                return res.status(200).send(resJson);
            });
    }
}