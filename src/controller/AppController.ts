import {NotificationService} from "../services/notification/NotificationService";
import {Request, Response} from "express";
import {AppServices} from "../services/AppServices";
import {ScheduleTaskList} from "../config/ScheduleTaskList";

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
            res.status(200).send({
                message: 'Success! App started.'
            })
        } else {
            res.status(200).send({
                message: 'Failed! App had already started.'
            })
        }

    }
}