import {CronScheduleModel} from "../models/CronScheduleModel";

export class ScheduleTaskList {
    //应用定时启动任务
    static appStartTaskEntity: CronScheduleModel = {
        cronTimeStr: '2 0 * * 0-6',//周一到周六 每天凌晨00:02执行
        cronSchedule: null
    };

    //定时停止应用
    static appStopTaskEntity: CronScheduleModel = {
        cronTimeStr: '59 23 * * 0-6',//周一到周六 每天深夜23:59执行
        cronSchedule: null
    };

    //定期获取奖号计划任务对象
    static awardFetchTaskEntity: CronScheduleModel = {
        cronTimeStr: '*/15 * * * * *',//25秒执行一次
        cronSchedule: null//cron对象
    };
    //预警通知计划任务
    static notificationTaskEntity: CronScheduleModel = {
        cronTimeStr: '*/1 * * * *',//每1分钟执行一次
        cronSchedule: null//cron对象
    };

}
