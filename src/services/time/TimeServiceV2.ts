import {ConstVars} from "../../global/ConstVars";
import {RejectionMsg} from "../../models/EnumModel";
import {AppSettings} from "../../config/AppSettings";
import {PeriodTime} from "../../models/PeriodTime";
import {Config, CONFIG_CONST} from "../../config/Config";
import moment  = require('moment');

let log4js = require('log4js'),
    log = log4js.getLogger('TimeServiceV2');

export class TimeServiceV2 {
    /**
     *
     * 更新下期可投注时间
     */
    public static updateNextPeriodInvestTime(): void {
        Config.globalVariable.nextPeriodInvestTime = TimeServiceV2.getNextOpenTime(new Date(), CONFIG_CONST.openTimeDelaySeconds);//更新开奖时间
    }

    /**
     *
     * 是否到达投注时间
     * @param currentTime
     * @param delaySeconds
     * @return {any}
     */
    public static isInvestTime(): Promise<boolean> {
        let currentTime: Date = new Date();//当前时间
        let delaySeconds: number = CONFIG_CONST.openTimeDelaySeconds;//开奖延迟时间
        if (Config.globalVariable.nextPeriodInvestTime == null) {
            Config.globalVariable.nextPeriodInvestTime = TimeServiceV2.getNextOpenTime(currentTime, delaySeconds);
            return Promise.resolve(true);
        }

        let nextOpenTime = TimeServiceV2.getNextOpenTime(currentTime, delaySeconds);
        //未到开奖时间
        if (nextOpenTime.getTime() == Config.globalVariable.nextPeriodInvestTime.getTime()) {
            log.info("当前时间: %s,下期可投注时间：%s", moment().format(ConstVars.momentDateTimeFormatter), moment(nextOpenTime).format(ConstVars.momentDateTimeFormatter));
            return Promise.reject(RejectionMsg.notReachInvestTime);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     *
     * 开奖时间当天开始的开奖时间，到第二天第1期开奖时间
     * @param {Date} currentTime
     * @param {number} delaySeconds
     */
    private static getOpenTimeList(currentTime: Date, delaySeconds = 0): Array<Date> {
        //当天的01:55到10:00
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的00:30
        let firstTime = new Date(year, month, day, 0, 30, 0);
        //当天的07:30
        let secondTime = new Date(year, month, day, 7, 30, 0);

        //第二天00:30
        let thirdTime = new Date(year, month, day + 1, 0, 30, 0);

        let openTimeList = [];
        //00:30-03:10， 共9期  20分钟一期
        for (let i = 0; i < 9; i++) {
            openTimeList.push(new Date(firstTime.getTime() + i * 20 * 60 * 1000 + delaySeconds * 1000));
        }
        //07:30-23:50， 共50期  20分钟一期
        for (let i = 0; i < 50; i++) {
            openTimeList.push(new Date(secondTime.getTime() + i * 20 * 60 * 1000 + delaySeconds * 1000));
        }

        //第二天00:30点
        openTimeList.push(new Date(thirdTime.getTime() + delaySeconds * 1000));

        return openTimeList;
    }

    /**
     *
     *
     * 获取下期的可投注时间
     * @param currentTime 当前系统时间
     * @param delaySeconds 开奖延迟时间
     */
    private static getNextOpenTime(currentTime: Date, delaySeconds = 0): Date {
        let openTimeList: Array<Date> = TimeServiceV2.getOpenTimeList(currentTime, delaySeconds);
        let nextOpenTime = null;
        let minDiffTime = Number.POSITIVE_INFINITY;//最小相差时间
        for (let currentOpenTime of openTimeList) {
            if (currentOpenTime > currentTime) {//查找最近的开奖时间
                let currentDiffTime = currentOpenTime.getTime() - currentTime.getTime();
                if (currentDiffTime < minDiffTime) {//找出和当前时间的 时间差最小的时间，即为下期的开奖时间
                    minDiffTime = currentDiffTime;
                    nextOpenTime = currentOpenTime;
                }
            }
        }

        return nextOpenTime;
    }

    /**
     *
     * 获取所有开奖的期号列表
     * period的格式为：20170625-080
     */
    private static getPeriodList(currentTime: Date, delaySeconds = 0): Array<PeriodTime> {
        let periodList = [];
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();
        let day = currentTime.getDate();
        //当天的00:30
        let firstTime = new Date(year, month, day, 0, 30, 0);
        //当天的07:30
        let secondTime = new Date(year, month, day, 7, 30, 0);

        //第二天00:30
        let thirdTime = new Date(year, month, day + 1, 0, 30, 0);

        let openTimeList = [];

        //前一天最后一期开奖时间是当天00:30:00
        let yearFragment = String(year);
        let monthFragment = (String(month + 1).length == 1 ? ('0' + String(month + 1)) : String(month + 1));
        let dayFragment = String(day).length == 1 ? ('0' + String(day)) : String(day);
        //timeFragment的格式为20170508-
        let timeFragement = yearFragment + monthFragment + dayFragment + '-';

        //00:30-03:10， 共9期  20分钟一期
        for (let i = 1; i <= 9; i++) {
            let delayTime = new Date(firstTime.getTime() + (i - 1) * 20 * 60 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p = (i < 10) ? ("00" + String(i)) : ("0" + String(i));
            let period = timeFragement + p;
            periodList.push({
                openTime: delayTime,
                period: period
            })
        }

        //07:30-23:50， 共50期  20分钟一期
        for (let i = 1; i <= 50; i++) {
            let delayTime = new Date(secondTime.getTime() + (i - 1) * 20 * 60 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p = (String(i + 9).length == 2) ? ("0" + String(i + 9)) : String(i + 9);
            let period = timeFragement + p;
            periodList.push({
                openTime: delayTime,
                period: period
            })
        }

        //当天最后一期 开奖时间是在下一天的00:30:00
        periodList.push({
            openTime: new Date(moment(firstTime).add('1', 'd').toDate().getTime() + delaySeconds * 1000),
            period: String(moment(currentTime).add('1', 'd').format("YYYYMMDD") + '-001')
        });

        return periodList;
    }

    /**
     *
     *
     * 获取当前投注的期号 格式为：20170625-080
     */
    public static getCurrentPeriodNumber(currentTime: Date): string {
        let periodList: Array<PeriodTime> = this.getPeriodList(currentTime, 0);
        let currentPeriod = null;
        let minDiffTime = Number.POSITIVE_INFINITY;//最小相差时间
        for (let i = 0; i < periodList.length; i++) {
            let periodTime = periodList[i];
            if (periodTime.openTime > currentTime) {
                let diffTime = periodTime.openTime.getTime() - currentTime.getTime();//找出和当前时间的 时间差最小的时间，即为当前的投注期号
                if (diffTime < minDiffTime) {
                    minDiffTime = diffTime;
                    currentPeriod = periodTime.period;
                }
            }
        }

        return currentPeriod;
    }

    /**
     *
     *
     * 获取上期投注的期号 格式为：20170625-080
     */
    public static getLastPeriodNumber(currentTime: Date): string {
        let periodList: Array<PeriodTime> = this.getPeriodList(currentTime, 0);
        let currentPeriod = null;
        let minDiffTime = Number.POSITIVE_INFINITY;//最小相差时间 初始值为无穷大
        for (let i = 0; i < periodList.length; i++) {
            let periodTime = periodList[i];
            if (periodTime.openTime < currentTime) {
                let diffTime = currentTime.getTime() - periodTime.openTime.getTime();//找出和当前时间的 时间差最小的时间，即为当前的投注期号
                if (diffTime < minDiffTime) {
                    minDiffTime = diffTime;
                    currentPeriod = periodTime.period;
                }
            }
        }

        return currentPeriod;
    }

    /**
     *
     * 获取当前期号的下期 期号 格式为：20170625-080
     * @param currentTime
     */
    public static getCurrentNextPeriodNumber(currentTime: Date): string {
        let periodList: Array<PeriodTime> = TimeServiceV2.getPeriodList(currentTime, 0);
        let currentPeriod = null;
        let minDiffTime = Number.POSITIVE_INFINITY;//最小相差时间
        for (let i = 0; i < periodList.length; i++) {
            let periodTime = periodList[i];
            if (periodTime.openTime > currentTime) {
                let diffTime = periodTime.openTime.getTime() - currentTime.getTime();//找出和当前时间的 时间差最小的时间，即为当前的投注期号
                if (diffTime < minDiffTime) {
                    minDiffTime = diffTime;
                    currentPeriod = periodList[i + 1].period;
                }
            }
        }

        return currentPeriod;
    }

    /**
     *
     * 是否是停止买卖时间  03:30-07:30 停止购买
     */
    public static isInStopInvestTime(): boolean {
        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();
        let day = currentTime.getDate();

        //当天03:10
        let twoClock = new Date(year, month, day, 3, 30, 0);
        //当天07:30
        let tenClock = new Date(year, month, day, 7, 30, 0);

        return currentTime > twoClock && currentTime < tenClock;
    }

    /**
     *
     * 是否到达设置中的结束投注时间
     */
    public static isReachInvestEndTime(): boolean {
        //0 不限制投注时间
        if (AppSettings.realInvestEndTime == '0') return false;

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        // 设置中的停止时间
        let investEndTime;
        let investEndTimeArr: Array<string> = AppSettings.realInvestEndTime.split(':');
        if (investEndTimeArr.length == 3) {
            investEndTime = new Date(year, month, day, Number(investEndTimeArr[0]), Number(investEndTimeArr[1]), Number(investEndTimeArr[2]));
        } else {
            //不限制
            return false;
        }

        return currentTime > investEndTime;
    }
}