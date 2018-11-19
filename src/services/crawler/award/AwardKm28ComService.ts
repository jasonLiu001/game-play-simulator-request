import {TimeService} from "../../time/TimeService";
import BlueBirdPromise = require('bluebird');
import {AwardInfo} from "../../../models/db/AwardInfo";
import {IAwardCrawler} from "./IAwardCrawler";
import {HttpRequestHeaders} from "../../../models/EnumModel";
import moment  = require('moment');

let log4js = require('log4js'),
    log = log4js.getLogger('AwardKm28ComService'),
    request = require('request'),
    cheerio = require('cheerio');

export class AwardKm28ComService implements IAwardCrawler {
    formatPeriod(periodString: string): string {
        return undefined;
    }

    getDataUrl(currentPeriod: string): string {
        let url = 'https://www.km28.com/lottery-gp/cqssc.html';
        return url;
    }

    getAwardInfo(updateStatus: number = 1): BlueBirdPromise<AwardInfo> {
        let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
        let dataUrl = this.getDataUrl(currentPeriod);
        return new BlueBirdPromise((resolve, reject) => {
            request(
                {
                    url: this.getDataUrl(null),
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    try {

                        let awardInfo = this.htmlBodyHandler(body, updateStatus);
                        log.info('%s 期开奖号码为：%s', awardInfo.period, awardInfo.openNumber);

                        resolve(awardInfo);
                    } catch (e) {
                        log.error(e);
                        reject(e);
                    }
                });
        });
    }

    /**
     *
     * 处理html内容
     * @param body 页面主体内容
     * @param updateStatus 更新状态 1：自动更新 2：手动更新
     */
    private htmlBodyHandler(body: string, updateStatus: number): AwardInfo {
        let awardInfoList: Array<AwardInfo> = this.getAwardInfoList(body, updateStatus);
        return awardInfoList[0];
    }

    /**
     *
     * 获取奖号列表
     * @param htmlBody html页面body体
     * @param updateStatus 更新状态 1：自动更新 2：手动更新
     */
    private getAwardInfoList(htmlBody: string, updateStatus: number): Array<AwardInfo> {
        let awardInfoList: Array<any> = [];
        let doc: any = cheerio.load(htmlBody);
        let openDateText: string = doc('div.r-box.fl.clearfix>div.padding>span:eq(1)').get(0).html();
        let openDateArr: Array<string> = openDateText.split("：");

        let tables: any = doc('table.tac.fl');
        for (let table of tables) {
            let tableElement: any = cheerio.load(table);
            let rowElements: any = tableElement('tbody tr');
            for (let row of rowElements) {
                let columnElement: any = cheerio.load(row);
                let columns: any = columnElement('tr td');

                let period: string = columns.get(0).html();
                let openTime: string = columns.get(1).html();
                let openNumber: string = columns.get(2).html().replace(/ /g, '');

                if (period.length == 2) {
                    period = openDateArr[1].replace(/-/g, '') + "-0" + period;
                }

                openTime = openDateArr[1] + " " + openTime + ":00";
                let awardInfo: AwardInfo = {
                    openNumber: period,
                    openTime: openTime,
                    period: openNumber,
                    createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updateStatus: updateStatus//自动更新
                };

                awardInfoList.push(awardInfo);
            }
        }
        return awardInfoList;
    }


}