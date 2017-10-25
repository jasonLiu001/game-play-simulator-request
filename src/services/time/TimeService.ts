import {Config} from "../../config/Config";
import {PeriodTime} from "../../models/PeriodTime";
import Promise = require('bluebird');
import _ = require('lodash');
import moment  = require('moment');
import {RejectionMsg} from "../../models/EnumModel";

export class TimeService {
    /**
     *
     * 更新下期可投注时间
     * @param currentTime
     * @param delaySeconds
     */
    public static updateNextPeriodInvestTime(currentTime: Date, delaySeconds = 0): void {
        Config.globalVariable.nextPeriodInvestTime = TimeService.getNextOpenTime(currentTime, delaySeconds);//更新开奖时间
    }

    /**
     *
     * 是否到达投注时间
     * @param currentTime
     * @param delaySeconds
     * @return {any}
     */
    public static isInvestTime(currentTime: Date, delaySeconds = 0): Promise<boolean> {
        if (Config.globalVariable.nextPeriodInvestTime == null) {
            Config.globalVariable.nextPeriodInvestTime = TimeService.getNextOpenTime(currentTime, delaySeconds);
            return Promise.resolve(true);
        }

        let nextOpenTime = TimeService.getNextOpenTime(currentTime, delaySeconds);
        //未到开奖时间
        if (nextOpenTime.getTime() == Config.globalVariable.nextPeriodInvestTime.getTime()) {
            return Promise.reject(RejectionMsg.notReachInvestTime);
        } else {
            return Promise.resolve(true);
        }
    }

    private static getOpenTimeList(currentTime: Date, delaySeconds = 0): Array<Date> {
        //当天的01:55到10:00
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的00:00
        let firstTime = new Date(year, month, day, 0, 0, 0);
        //当天的10:00
        let secondTime = new Date(year, month, day, 10, 0, 0);
        //当天的22:00
        let thirdTime = new Date(year, month, day, 22, 0, 0);
        //第二天10:00
        let fourthTime = new Date(year, month, day + 1, 10, 0, 0);

        let openTimeList = [];
        openTimeList.push(new Date(firstTime.getTime() + delaySeconds * 1000));//当天的00:00
        //00:00-01:55， 共23期
        for (let i = 1; i <= 23; i++) {
            openTimeList.push(new Date(firstTime.getTime() + i * 5 * 60 * 1000 + delaySeconds * 1000));
        }

        //10:00-22:00，共72期
        openTimeList.push(new Date(secondTime.getTime() + delaySeconds * 1000));//当天10:00
        for (let i = 1; i <= 72; i++) {
            openTimeList.push(new Date(secondTime.getTime() + i * 10 * 60 * 1000 + delaySeconds * 1000))
        }

        // 22:00-01:55，共48期
        for (let i = 1; i < 48; i++) {
            openTimeList.push(new Date(thirdTime.getTime() + i * 5 * 60 * 1000 + delaySeconds * 1000))
        }

        //第二天10点
        openTimeList.push(new Date(fourthTime.getTime() + delaySeconds * 1000));

        return openTimeList;
    }

    /**
     *
     *
     * 获取下期的可投注时间
     */
    public static getNextOpenTime(currentTime: Date, delaySeconds = 0): Date {
        let openTimeList = TimeService.getOpenTimeList(currentTime, delaySeconds);
        let nextOpenTime = null;
        let minDiffTime = Number.POSITIVE_INFINITY;//最小相差时间
        for (let i = 0; i < openTimeList.length; i++) {
            let currentOpenTime = openTimeList[i];
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
     *
     * period的格式为：20170625-080
     */
    private static getPeriodList(currentTime: Date, delaySeconds = 0): Array<PeriodTime> {
        let periodList = [];
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();
        let day = currentTime.getDate();
        let firstTime = new Date(year, month, day, 0, 0, 0);
        let secondTime = new Date(year, month, day, 10, 0, 0);
        let thirdTime = new Date(year, month, day, 22, 0, 0);
        let fourthTime = new Date(year, month, day + 1, 10, 0, 0);
        let openTimeList = [];
        openTimeList.push(new Date(firstTime.getTime() + delaySeconds * 1000));
        //前一天最后一期开奖时间是当天00:00:00
        let yearFragment = String(year);
        let monthFragment = (String(month + 1).length == 1 ? ('0' + String(month + 1)) : String(month + 1));
        let dayFragment = String(day).length == 1 ? ('0' + String(day)) : String(day);
        //timeFragment的格式为20170508-
        let timeFragement = yearFragment + monthFragment + dayFragment + '-';

        let lastPeriod = String(moment(currentTime).subtract('1', 'd').format('YYYYMMDD')) + '-120';
        periodList.push({
            openTime: new Date(firstTime.getTime() + delaySeconds * 1000),
            period: lastPeriod
        });

        for (let i = 1; i <= 23; i++) {
            let delayTime = new Date(firstTime.getTime() + i * 5 * 60 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p = (i < 10) ? ("00" + String(i)) : ("0" + String(i));
            let period = timeFragement + p;
            periodList.push({
                openTime: delayTime,
                period: period
            })
        }
        openTimeList.push(new Date(secondTime.getTime() + delaySeconds * 1000));
        let tempPeriod = timeFragement + '024';
        periodList.push({
            openTime: new Date(secondTime.getTime() + delaySeconds * 1000),
            period: tempPeriod
        });
        for (let i = 1; i <= 72; i++) {
            let delayTime = new Date(secondTime.getTime() + i * 10 * 60 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p = (String(i + 24).length == 2) ? ("0" + String(i + 24)) : String(i + 24);
            let period = timeFragement + p;
            periodList.push({
                openTime: delayTime,
                period: period
            })
        }
        for (let i = 1; i < 48; i++) {
            let delayTime = new Date(thirdTime.getTime() + i * 5 * 60 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p = (String(i + 96).length == 2) ? ("0" + String(i + 96)) : String(i + 96);
            let period = timeFragement + p;
            if (period == timeFragement + '120') break;
            periodList.push({
                openTime: delayTime,
                period: period
            });
        }

        //当天最后一期 开奖时间是在下一天的00:00:00
        periodList.push({
            openTime: new Date(moment(firstTime).add('1', 'd').toDate().getTime() + delaySeconds * 1000),
            period: String(moment(currentTime).format("YYYYMMDD") + '-120')
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
     * 获取当前期号的下期 期号 格式为：20170625-080
     * @param currentTime
     */
    public static getCurrentNextPeriodNumber(currentTime: Date): string {
        let periodList: Array<PeriodTime> = TimeService.getPeriodList(currentTime, 0);
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
     * 是否是停止买卖时间  02:00-10:00 停止购买
     */
    public static isInStopInvestTime(): boolean {
        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();
        let day = currentTime.getDate();

        //当天02:00
        let twoClock = new Date(year, month, day, 2, 0, 0);
        //当天10:00
        let tenClock = new Date(year, month, day, 10, 0, 0);

        if (currentTime > twoClock && currentTime < tenClock) {
            return true;
        }

        return false;
    }
}