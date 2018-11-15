import {Request, Response} from 'express';
import {ScheduleTaskList} from "../config/ScheduleTaskList";
import {AppServices} from "../services/AppServices";
import {NotificationService} from "../services/notification/NotificationService";

let notificationService = new NotificationService();

export class AwardController {
    public getAward(req: Request, res: Response) {
        res.status(200).send({
            message: 'GET request successfulll!!!!'
        })
    }

    public startApp(req: Request, res: Response) {
        if (ScheduleTaskList.appStartTaskEntity.cronSchedule == null) {
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

