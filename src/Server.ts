import {NotificationService} from "./services/notification/NotificationService";
import cron = require('node-cron');
import app from "./app";
import moment  = require('moment');
import {AppServices} from "./services/AppServices";
import {ScheduleTaskList} from "./config/ScheduleTaskList";

let log4js = require('log4js'),
    log = log4js.getLogger('Server'),
    notificationService = new NotificationService();

const PORT = 6080;

//node-cron的格式可能和linux中crontab有区别，设置时请参考文档：https://www.npmjs.com/package/node-cron
ScheduleTaskList.appStartTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStartTaskEntity.cronTimeStr, () => {
    log.info('执行启动app任务，当前时间：%s', moment().format('YYYY-MM-DD HH:mm:ss'));
    //启动投注程序
    AppServices.start();
    //启动通知程序
    notificationService.start();
});

//每天固定时间停止 预警及获取奖号计划任务
ScheduleTaskList.appStopTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStopTaskEntity.cronTimeStr, () => {
    log.info('停止app所有任务，当前时间：%s', moment().format('YYYY-MM-DD HH:mm:ss'));
    //销毁获取奖号
    ScheduleTaskList.awardFetchTaskEntity.cronSchedule.destroy();
    ScheduleTaskList.awardFetchTaskEntity.cronSchedule = null;
    //销毁预警通知
    ScheduleTaskList.notificationTaskEntity.cronSchedule.destroy();
    ScheduleTaskList.notificationTaskEntity.cronSchedule = null;
});

app.listen(PORT, () => {
    log.info('Express server listening on port ' + PORT);
});