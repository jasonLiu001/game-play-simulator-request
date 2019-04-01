import {NotificationService} from "../services/notification/NotificationService";
import {Request, Response} from "express";
import {ScheduleTaskList} from "../config/ScheduleTaskList";
import {ResponseJson} from "../models/ResponseJson";
import {ConstVars} from "../global/ConstVars";
import {AppServices} from "../services/AppServices";
import moment  = require('moment');
import BlueBirdPromise = require('bluebird');

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
            AppServices.startAppServices();
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

    /**
     *
     * 停止app
     */
    async stop(req: Request, res: Response): BlueBirdPromise<any> {
        log.info('接收到停止app请求，当前时间：%s', moment().format(ConstVars.momentDateTimeFormatter));
        if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule != null) {
            //销毁获取奖号
            ScheduleTaskList.awardFetchTaskEntity.cronSchedule.destroy();
            ScheduleTaskList.awardFetchTaskEntity.cronSchedule = null;
        }
        if (ScheduleTaskList.notificationTaskEntity.cronSchedule != null) {
            //销毁预警通知
            ScheduleTaskList.notificationTaskEntity.cronSchedule.destroy();
            ScheduleTaskList.notificationTaskEntity.cronSchedule = null;
        }
        AppServices.initAppStartConfig();//重置应用运行参数
        let jsonRes: ResponseJson = new ResponseJson();
        let msg: string = 'app停止命令已成功执行!';
        jsonRes.success(msg, msg);
        return res.status(200).send(jsonRes);
    }
}
