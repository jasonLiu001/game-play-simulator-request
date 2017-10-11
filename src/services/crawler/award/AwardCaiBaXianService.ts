import {IAwardCrawler} from "./IAwardCrawler";
import {Config} from "../../../config/Config";
import Promise = require('bluebird');
import {AwardInfo} from "../../../models/AwardInfo";

let request = require('request');

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

    getAwardInfo(): Promise<any> {
        let dataUrl = this.getDataUrl(null);
        return new Promise((resolve, reject) => {
            request(
                {
                    uri: dataUrl,
                    headers: Config.HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) reject(error);
                    let data = body.replace('?(\'', '').replace('\')', '');
                    let lotteryData: any;
                    try {
                        lotteryData = JSON.parse(data)
                    } catch (e) {
                        reject(e);
                    }

                    let periodString = lotteryData.currexpect;
                    let num = periodString.substring(6);
                    let monthFragment = periodString.substr(2, 2);
                    let dayFragment = periodString.substr(4, 2);
                    let year = String(new Date().getFullYear());

                    let awardInfo: AwardInfo = {
                        period: year + '' + monthFragment + '' + dayFragment + '-' + num,
                        openNumber: lotteryData.opencode,
                        openTime: lotteryData.timeStop
                    };
                    resolve(awardInfo);
                });
        });
    }
}