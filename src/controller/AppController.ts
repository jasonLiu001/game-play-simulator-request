import {NotificationService} from "../services/notification/NotificationService";
import {Request, Response} from "express";
import {AppServices} from "../services/AppServices";
import {ScheduleTaskList} from "../config/ScheduleTaskList";
import {ResponseJson} from "../models/ResponseJson";

let log4js = require('log4js'),
    log = log4js.getLogger('AppController'),
    notificationService = new NotificationService();

export class AppController {
    /**
     *
     * 启动app
     */
    public start(req: Request, res: Response) {
        if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule == null && ScheduleTaskList.notificationTaskEntity.cronSchedule == null) {
            //启动投注程序
            AppServices.start();
            //启动通知程序
            notificationService.start();
            let successJson: ResponseJson = new ResponseJson();
            let msg: string = 'Success! App started.';
            successJson.success(msg, msg);
            res.status(200).send(successJson);
        } else {
            let jsonRes: ResponseJson = new ResponseJson();
            let errMsg: string = 'Failed! App had already started.';
            jsonRes.fail(errMsg, errMsg);
            res.status(200).send(jsonRes);
        }

    }
}