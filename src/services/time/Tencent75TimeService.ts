import Promise = require('bluebird');
import moment  = require('moment');
import {ConstVars} from "../../global/ConstVars";
import {RejectionMsg} from "../../models/EnumModel";
import {AppSettings} from "../../config/AppSettings";
import {PeriodTime} from "../../models/PeriodTime";
import {Config, CONFIG_CONST} from "../../config/Config";


let log4js = require('log4js'),
    log = log4js.getLogger('Tencent75TimeService');

export class Tencent75TimeService {
    /**
     *
     * 更新下期可投注时间
     */
    static updateNextPeriodInvestTime(): void {
        Config.globalVariable.nextPeriodInvestTime = Tencent75TimeService.getNextOpenTime(new Date(), CONFIG_CONST.openTimeDelaySeconds);//更新开奖时间
    }

    /**
     *
     * 是否到达投注时间
     */
    static isInvestTime(): Promise<boolean> {
        let currentTime: Date = new Date();//当前时间
        let delaySeconds: number = CONFIG_CONST.openTimeDelaySeconds;//开奖延迟时间
        if (Config.globalVariable.nextPeriodInvestTime == null) {
            Config.globalVariable.nextPeriodInvestTime = Tencent75TimeService.getNextOpenTime(currentTime, delaySeconds);
            return Promise.resolve(true);
        }

        let nextOpenTime = Tencent75TimeService.getNextOpenTime(currentTime, delaySeconds);
        //未到开奖时间
        if (nextOpenTime.getTime() == Config.globalVariable.nextPeriodInvestTime.getTime()) {
            log.info("当前时间: %s,下期可投注时间：%s", moment().format(ConstVars.momentDateTimeFormatter), moment(nextOpenTime).format(ConstVars.momentDateTimeFormatter));
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

        let openTimeList = [];
        openTimeList.push(new Date(firstTime.getTime() + delaySeconds * 1000));//当天的00:00
        //00:00-23:59:55， 共1152期
        for (let i = 1; i <= 1153; i++) {
            openTimeList.push(new Date(firstTime.getTime() + i * 75 * 1000 + delaySeconds * 1000));
        }

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
        let openTimeList: Array<Date> = Tencent75TimeService.getOpenTimeList(currentTime, delaySeconds);
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
     *
     * period的格式为：201706250080
     */
    private static getPeriodList(currentTime: Date, delaySeconds = 0): Array<PeriodTime> {
        let periodList = [];
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();
        let day = currentTime.getDate();
        let firstTime = new Date(year, month, day, 0, 0, 0);
        let openTimeList = [];
        openTimeList.push(new Date(firstTime.getTime() + delaySeconds * 1000));
        //前一天最后一期开奖时间是当天00:00:00
        let yearFragment = String(year);
        let monthFragment = (String(month + 1).length == 1 ? ('0' + String(month + 1)) : String(month + 1));
        let dayFragment = String(day).length == 1 ? ('0' + String(day)) : String(day);
        //timeFragment的格式为20170508-
        let timeFragement = yearFragment + monthFragment + dayFragment;

        for (let i = 1; i <= 1153; i++) {
            let delayTime = new Date(firstTime.getTime() + i * 75 * 1000 + delaySeconds * 1000);
            openTimeList.push(delayTime);
            let p: string = String(i);
            if (i < 10) {
                p = "000" + String(i);
            } else if (i < 100) {
                p = "00" + String(i);
            } else if (i < 1000) {
                p = "0" + String(i);
            }

            let period = timeFragement + p;
            periodList.push({
                openTime: delayTime,
                period: period
            });
        }
        return periodList;
    }

    /**
     *
     *
     * 获取当前投注的期号 格式为：201706250080
     */
    static getCurrentPeriodNumber(currentTime: Date): string {
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
     * 获取上期投注的期号 格式为：201706250080
     */
    static getLastPeriodNumber(currentTime: Date): string {
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
     * 获取当前期号的下期 期号 格式为：201706250080
     * @param currentTime
     */
    static getCurrentNextPeriodNumber(currentTime: Date): string {
        let periodList: Array<PeriodTime> = Tencent75TimeService.getPeriodList(currentTime, 0);
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
     * 是否是停止买卖时间  true:停止购买 false:不停止
     */
    static isInStopInvestTime(): boolean {
        return false;
    }

    /**
     *
     * 是否到达设置中的结束投注时间
     */
    static isReachInvestEndTime(): boolean {
        //0 不限制投注时间
        if (AppSettings.realInvestEndTime == '0') return false;

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的21:59
        let thirdTime = new Date(year, month, day, 21, 59, 0);
        let investEndTimeArr: Array<string> = AppSettings.realInvestEndTime.split(':');
        if (investEndTimeArr.length == 3) {
            thirdTime = new Date(year, month, day, Number(investEndTimeArr[0]), Number(investEndTimeArr[1]), Number(investEndTimeArr[2]));
        }

        return currentTime > thirdTime;
    }
}