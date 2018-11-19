import {IAwardCrawler} from "./IAwardCrawler";
import Promise = require('bluebird');
import moment  = require('moment');
import {AwardInfo} from "../../../models/db/AwardInfo";
import {HttpRequestHeaders} from "../../../models/EnumModel";

let request = require('request'),
    log4js = require('log4js'),
    log = log4js.getLogger('AwardCaiBaXianService');

/**
 *
 *
 * 网址:www.caibaxian.com
 */
export class AwardCaiBaXianService implements IAwardCrawler {
    formatPeriod(periodString: string): string {
        let num = periodString.substring(6);
        let monthFragment = periodString.substr(2, 2);
        let dayFragment = periodString.substr(4, 2);
        let year = String(new Date().getFullYear());
        return year + '' + monthFragment + '' + dayFragment + '-' + num;
    }

    getDataUrl(currentPeriod: string): string {
        return 'http://www.caibaxian.com/open.aspx?callback=?';
    }

    getAwardInfo(updateStatus: number = 1): Promise<AwardInfo> {
        let dataUrl = this.getDataUrl(null);
        return new Promise((resolve, reject) => {
            request(
                {
                    uri: dataUrl,
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) reject(error);
                    let data = body.replace('?(\'', '').replace('\')', '');
                    let lotteryData: any;
                    try {
                        lotteryData = JSON.parse(data)
                    } catch (e) {
                        log.error(e);
                        reject(e);
                    }

                    try {
                        let periodString = lotteryData.currexpect;
                        let num = periodString.substring(6);
                        let monthFragment = periodString.substr(2, 2);
                        let dayFragment = periodString.substr(4, 2);
                        let year = String(new Date().getFullYear());

                        let awardInfo: AwardInfo = {
                            period: year + '' + monthFragment + '' + dayFragment + '-' + num,
                            openNumber: lotteryData.opencode,
                            openTime: lotteryData.timeStop,
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
