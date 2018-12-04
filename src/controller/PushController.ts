import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {ResponseJson} from "../models/ResponseJson";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {InvestPushInfo} from "../models/db/InvestPushInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('PushController');

export class PushController {
    public saveDeviceToken(req: Request, res: Response): any {
        let deviceToken: string = req.body.deviceToken;
        let imei: string = req.body.imei;
        let pushPlatform: number = req.body.pushPlatform;

        let jsonRes: ResponseJson = new ResponseJson();
        log.info('保存deviceToken请求已收到，参数:deviceToken=%s', deviceToken);

        //保存的token实体
        let investPushModel: InvestPushInfo = {
            deviceToken: deviceToken,
            imei: imei,
            pushPlatform: pushPlatform,
            tokenExpireTime: '',
            createdTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        LotteryDbService.saveOrUpdateInvestPushInfo(investPushModel)
            .then(() => {
                let successMsg: string = "deviceToken:" + investPushModel.deviceToken + " 保存成功";
                jsonRes.success(successMsg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "deviceToken保存失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            });
    }
}
