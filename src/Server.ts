import * as bodyParser from "body-parser";
import * as express from "express";
import {NotificationService} from "./services/notification/NotificationService";
import cron = require('node-cron');
import moment  = require('moment');
import {AppServices} from "./services/AppServices";
import {ScheduleTaskList} from "./config/ScheduleTaskList";

let app: express.Application = express();
const PORT = 6080;

let log4js = require('log4js'),
    path = require('path');
log4js.configure(path.resolve(__dirname, '.', 'config/log4js.json'));

//日志文件
let log = log4js.getLogger('Server'),
    notificationService = new NotificationService();

//api 路由配置
let appRoutes = require("./routes/AppRoutes"),
    awardRoutes = require("./routes/AwardRoutes"),
    investRoutes = require("./routes/InvestRoutes");

// support application/json type post data
app.use(bodyParser.json());
//support application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: false}));
//static resources 访问时不需要添加static到路径  http://localhost:6080/lib/lodash.js
app.use(express.static(__dirname + '/static'));
//添加log4js到express
app.use(log4js.connectLogger(log, {level: log4js.levels.DEBUG}));

//register all routes
app.use('/app', appRoutes);
app.use('/award', awardRoutes);
app.use('/invest', investRoutes);

//node-cron的格式可能和linux中crontab有区别，设置时请参考文档：https://www.npmjs.com/package/node-cron
ScheduleTaskList.appStartTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStartTaskEntity.cronTimeStr, () => {
    AppServices.initAppStartConfig();//重置应用运行参数
    log.info('执行启动app任务，当前时间：%s', moment().format('YYYY-MM-DD HH:mm:ss'));
    if (ScheduleTaskList.awardFetchTaskEntity.cronSchedule == null) {
        //启动投注程序
        AppServices.start();
    } else {
        log.error("主程序已启动，无需重复启动！")
    }
    if (ScheduleTaskList.notificationTaskEntity.cronSchedule == null) {
        //启动通知程序
        notificationService.start();
    } else {
        log.error("通知程序已启动，无需重复启动！")
    }
});

//每天固定时间停止 预警及获取奖号计划任务
ScheduleTaskList.appStopTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.appStopTaskEntity.cronTimeStr, () => {
    log.info('主程序及子任务已终止，当前时间：%s', moment().format('YYYY-MM-DD HH:mm:ss'));
    //销毁获取奖号
    ScheduleTaskList.awardFetchTaskEntity.cronSchedule.destroy();
    ScheduleTaskList.awardFetchTaskEntity.cronSchedule = null;
    log.info('主程序已停止');
    //销毁预警通知
    ScheduleTaskList.notificationTaskEntity.cronSchedule.destroy();
    ScheduleTaskList.notificationTaskEntity.cronSchedule = null;
    log.info('通知程序已停止');
    AppServices.initAppStartConfig();//重置应用运行参数
});

app.listen(PORT, () => {
    log.info('Express server listening on port ' + PORT);
});
