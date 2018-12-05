import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {ResponseJson} from "../models/ResponseJson";
import {LotteryDbService} from "../services/dbservices/ORMService";
import {InvestPushInfo} from "../models/db/InvestPushInfo";
import {PushService} from "../services/push/PushService";

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
            tokenExpireTime: null,
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

    public sendPush(req: Request, res: Response): any {
        let title: string = req.body.title;
        let content: string = req.body.content;

        let jsonRes: ResponseJson = new ResponseJson();
        log.info('sendPush方法请求已收到，参数:title=%s,content=%s', title, content);

        PushService.send(title, content)
            .then(() => {
                let successMsg: string = "Push发送成功";
                jsonRes.success(successMsg);
                log.info("%s，当前时间：%s", successMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "push发送失败";
                jsonRes.fail(errMsg, e.message);
                log.info("%s，当前时间：%s", errMsg, moment().format('YYYY-MM-DD HH:mm:ss'));
                return res.status(200).send(jsonRes);
            });
    }
}
