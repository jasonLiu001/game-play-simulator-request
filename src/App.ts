import {AppServices} from "./services/AppServices";
import {ScheduleTaskList} from "./config/ScheduleTaskList";
import {ConstVars} from "./global/ConstVars";
import {NotificationService} from "./services/notification/NotificationService";
import cron = require('node-cron');
import moment  = require('moment');

let log4js = require('log4js'),
    path = require('path');
log4js.configure(path.resolve(__dirname, '.', 'config/log4js.json'));

//日志文件
let log = log4js.getLogger('App'),
    notificationService = new NotificationService();

//启动投注程序
AppServices.start();
//启动通知程序
notificationService.start();

//node-cron的格式可能和linux中crontab有区别，设置时请参考文档：https://www.npmjs.com/package/node-cron
ScheduleTaskList.appStartTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStartTaskEntity.cronTimeStr, () => {
    //AppServices.initAppStartConfig();//重置应用运行参数
    log.info('执行启动app任务，当前时间：%s', moment().format(ConstVars.momentDateTimeFormatter));
    if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule == null) {
        //启动投注程序
        //AppServices.start();
    } else {
        log.error("主程序已启动，无需重复启动！");
    }
    if (ScheduleTaskList.notificationTaskEntity.cronSchedule == null) {
        //启动通知程序
        //notificationService.start();
    } else {
        log.error("通知程序已启动，无需重复启动！");
    }
});

//每天固定时间停止 预警及获取奖号计划任务
ScheduleTaskList.appStopTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStopTaskEntity.cronTimeStr, () => {
    log.info('主程序及子任务已终止，当前时间：%s', moment().format(ConstVars.momentDateTimeFormatter));
    if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule != null) {
        //销毁获取奖号
        ScheduleTaskList.awardFetchTaskEntity.cronSchedule.destroy();
        ScheduleTaskList.awardFetchTaskEntity.cronSchedule = null;
    }
    log.info('主程序已停止');
    if (ScheduleTaskList.notificationTaskEntity.cronSchedule != null) {
        //销毁预警通知
        ScheduleTaskList.notificationTaskEntity.cronSchedule.destroy();
        ScheduleTaskList.notificationTaskEntity.cronSchedule = null;
    }
    log.info('通知程序已停止');
    //AppServices.initAppStartConfig();//重置应用运行参数
});