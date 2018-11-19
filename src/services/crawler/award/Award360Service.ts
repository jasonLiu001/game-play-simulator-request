import {TimeService} from "../../time/TimeService";
import Promise = require('bluebird');
import moment  = require('moment');
import {AwardInfo} from "../../../models/db/AwardInfo";
import {IAwardCrawler} from "./IAwardCrawler";
import {HttpRequestHeaders} from "../../../models/EnumModel";

let log4js = require('log4js'),
    log = log4js.getLogger('Award360Service'),
    request = require('request');

/**
 *
 *
 * 获取http://chart.cp.360.c开奖数据
 */
export class Award360Service implements IAwardCrawler {
    formatPeriod(periodString: string): string {
        let num = periodString.substring(6);
        let monthFragment = periodString.substr(2, 2);
        let dayFragment = periodString.substr(4, 2);
        let year = String(new Date().getFullYear());
        return year + '' + monthFragment + '' + dayFragment + '-' + num;
    }


    /**
     *
     *
     * 360网站对应的开奖获取地址
     * http://chart.cp.360.cn/zst/qkj/?lotId=255401&issue=170608107&r=80909373505058
     * @param {String} currentPeriod 格式:20170625-076
     */
    getDataUrl(currentPeriod: string): string {
        //期号格式，360要求的数据格式为:170608107
        let formatPeriod = currentPeriod.replace('-', '').substring(2);
        //对应的lotId=255401
        return 'http://chart.cp.360.cn/zst/qkj/?lotId=255401&issue=' + formatPeriod + '&r=' + Math.random();
    }

    /**
     *
     *
     * 获取奖号信息
     */
    getAwardInfo(updateStatus: number = 1): Promise<any> {
        let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
        let dataUrl = this.getDataUrl(currentPeriod);
        return new Promise((resolve, reject) => {
            request(
                {
                    uri: dataUrl,
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    try {
                        let lotteryData: any = JSON.parse(body);
                        let periodString = lotteryData[0].Issue;
                        let num = periodString.substring(6);
                        let monthFragment = periodString.substr(2, 2);
                        let dayFragment = periodString.substr(4, 2);
                        let year = String(new Date().getFullYear());

                        let awardInfo: AwardInfo = {
                            openNumber: lotteryData[0].WinNumber,
                            period: year + '' + monthFragment + '' + dayFragment + '-' + num,
                            openTime: lotteryData[0].EndTime,
                            createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                            updateStatus: updateStatus//自动更新
                        };
                        resolve(awardInfo);

                    } catch (e) {
                        log.error(e);
                        reject(e);
                    }
                });
        });
    }
}
