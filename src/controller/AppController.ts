import {NotificationService} from "../services/notification/NotificationService";
import {Request, Response} from "express";
import {AppServices} from "../services/AppServices";
import {ScheduleTaskList} from "../config/ScheduleTaskList";
import {ResponseJson} from "../models/ResponseJson";
import moment  = require('moment');
import BlueBirdPromise = require('bluebird');
import {ConstVars} from "../global/ConstVars";

let log4js = require('log4js'),
    log = log4js.getLogger('AppController'),
    notificationService = new NotificationService();

export class AppController {
    /**
     *
     * 启动app
     */
    async start(req: Request, res: Response): BlueBirdPromise<any> {
        if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule == null && ScheduleTaskList.notificationTaskEntity.cronSchedule == null) {
            //启动投注程序
            //AppServices.start();
            //启动通知程序
            //notificationService.start();
            let jsonRes: ResponseJson = new ResponseJson();
            let msg: string = '恭喜！程序已成功启动!赚钱咯！';
            jsonRes.success(msg, msg);
            log.info('%s 当前时间：%s', msg, moment().format(ConstVars.momentDateTimeFormatter));
            return res.status(200).send(jsonRes);
        } else {
            let jsonRes: ResponseJson = new ResponseJson();
            let errMsg: string = '程序正在运行，无法重复启动!';
            jsonRes.fail(errMsg, errMsg);
            log.info('%s 当前时间：%s', errMsg, moment().format(ConstVars.momentDateTimeFormatter));
            return res.status(200).send(jsonRes);
        }

    }
}
