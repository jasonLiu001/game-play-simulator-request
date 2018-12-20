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

                        let awardInfo: AwardInfo = this.htmlBodyHandler(body, updateStatus);
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
        return awardInfoList.slice(awardInfoList.length - 1)[0];
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
        let openDateText: string = doc('body > div:nth-child(6) > div.container.right-ctn.fr > div > div > div > div > span:nth-child(2)').eq(0).text();
        let openDateArr: Array<string> = openDateText.split("：");

        let tables: any = doc('table.tac.fl');
        for (let table of tables) {
            let tableElement: any = cheerio.load(table);
            let rowElements: any = tableElement('tbody tr');
            for (let row of rowElements) {
                let columnElement: any = cheerio.load(row);
                let columns: any = columnElement('tr td');

                let period: string = columns.eq(0).html();
                let openTime: string = columns.eq(1).html();
                let openNumber: string = columns.eq(2).html().replace(/ /g, '');

                //这个网站的期号处理和其他网站有区别，需要特别处理，多加了一位
                let formatPeriod: number = Number(period);
                let resultPeriod: number = formatPeriod - 1;

                if (resultPeriod == 0) {//单独处理这个特殊情况 120的期号，肯定上前一天的时间，因为更新发生在下一天
                    resultPeriod = 120;
                    period = moment(openDateArr[1].replace(/-/g, '')).subtract(1, 'days').format('YYYYMMDD') + "-" + String(resultPeriod);
                }
                else if (String(resultPeriod).length == 1) {
                    period = openDateArr[1].replace(/-/g, '') + "-00" + String(resultPeriod);
                } else if (String(resultPeriod).length == 2) {
                    period = openDateArr[1].replace(/-/g, '') + "-0" + String(resultPeriod);
                } else if (String(resultPeriod).length == 3) {
                    period = openDateArr[1].replace(/-/g, '') + "-" + String(resultPeriod);
                }

                openTime = openDateArr[1] + " " + openTime + ":00";
                let awardInfo: AwardInfo = {
                    openNumber: openNumber,
                    openTime: openTime,
                    period: period,
                    createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updateStatus: updateStatus//自动更新
                };
                if (awardInfo.openNumber != '') {
                    awardInfoList.push(awardInfo);
                }
            }
        }
        return awardInfoList;
    }


}
