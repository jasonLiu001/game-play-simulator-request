import {CronScheduleModel} from "../models/CronScheduleModel";

export class ScheduleTaskList {
    //应用定时启动任务
    public static appStartTaskEntity: CronScheduleModel = {
        cronTimeStr: '20 7 * * 0-6',//周一到周六 每天上午07:20执行
        cronSchedule: null
    };

    //定时停止应用
    public static appStopTaskEntity: CronScheduleModel = {
        cronTimeStr: '20 3 * * 0-6',//周一到周六 每天上午3:20执行
        cronSchedule: null
    };

    //定期获取奖号计划任务对象
    public static awardFetchTaskEntity: CronScheduleModel = {
        cronTimeStr: '*/25 * * * * *',//25秒执行一次
        cronSchedule: null//cron对象
    };
    //预警通知计划任务
    public static notificationTaskEntity: CronScheduleModel = {
        cronTimeStr: '*/2 * * * *',//每1分钟执行一次
        cronSchedule: null//cron对象
    };

}
