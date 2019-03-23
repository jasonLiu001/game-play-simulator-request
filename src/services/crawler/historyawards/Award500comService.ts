import Promise = require('bluebird');
import moment  = require('moment');

let cheerio = require('cheerio'),
    log4js = require('log4js'),
    log = log4js.getLogger('Award500comService');


/**
 *
 * XML数据地址： http://kaijiang.500.com/static/public/ssc/xml/qihaoxml/20181001.xml?_A=SRZANHID1538363085068
 */
import {AwardInfo} from "../../../models/db/AwardInfo";
import {GlobalRequest} from "../../../global/GlobalRequest";
import {EnumAwardUpdateStatus} from "../../../models/EnumModel";
import {ConstVars} from "../../../global/ConstVars";

/**
 *
 * 500.com开奖号码的实体对象
 */
class AwardInfo500Com {
    expect: string = "";
    opencode: string = "";
    opentime: string = "";
}

export class Award500comService {
    /**
     *
     * 根据日期获取历史开奖号码号码
     */
    static getHistoryAwardByDate(periodDate: string): Promise<Array<AwardInfo>> {
        //moment().unix() 可以获取到10位数的unix时间戳（单位秒）
        let url: string = "http://kaijiang.500.com/static/public/ssc/xml/qihaoxml/" + moment(periodDate).format("YYYYMMDD") + ".xml?_A=" + new Date().getTime();
        return new Promise((resolve, reject) => {
            GlobalRequest.request(
                {
                    url: url,
                    method: 'GET',
                    encoding: 'utf8',
                    gzip: true
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    try {
                        let awardList: Array<AwardInfo> = Award500comService.getHistoryAwards(body);
                        resolve(awardList);
                    }
                    catch (e) {
                        log.error(e);
                        reject(e);
                    }

                });
        });
    }

    /**
     *
     * 处理xml内容 ，转换成数组
     * @param xmlBody
     * @returns {Array<AwardInfo>}
     */
    private static getHistoryAwards(xmlBody: any): Array<AwardInfo> {
        let awardList: Array<AwardInfo> = [];
        let doc: any = cheerio.load(xmlBody, {normalizeWhitespace: true, xmlMode: true});
        let rows: Array<any> = doc("row");
        for (let row of rows) {
            let awardInfo500Com: AwardInfo500Com = row.attribs;
            //处理期号
            let expectArr = awardInfo500Com.expect.split('');
            expectArr.splice(8, 0, '-');
            awardInfo500Com.expect = expectArr.toString().replace(/,/ig, '');

            //封装开奖号码
            let awardInfo: AwardInfo = {
                period: awardInfo500Com.expect,
                openNumber: awardInfo500Com.opencode.replace(/,/ig, ''),
                openTime: awardInfo500Com.opentime,
                createdTime: moment().format(ConstVars.momentDateTimeFormatter),
                updateStatus: EnumAwardUpdateStatus.MANUAL_UPDATE
            };
            awardList.push(awardInfo);
        }
        return awardList;
    }
}