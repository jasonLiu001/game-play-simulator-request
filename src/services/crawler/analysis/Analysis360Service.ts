import {IAnalysisCrawler} from "./IAnalysisCrawler";
import Promise = require('bluebird');
import _ = require('lodash');
import {EnumKillNumberPosition, HttpRequestHeaders} from "../../../models/EnumModel";


let log4js = require('log4js'),
    log = log4js.getLogger('Analysis360Service'),
    path = require('path'),
    request = require('request'),
    cheerio = require('cheerio');

export class Analysis360Service implements IAnalysisCrawler {

    /**
     *
     *
     * 杀号索引 在图表上的列索引 根据这个索引可以找到要杀的号码
     */
    public static killNumberIndex: number = null;

    /**
     *
     *
     * 获取杀号url
     * @param killNumberPosition 位置信息
     */
    private getKillNumberUrl(killNumberPosition: EnumKillNumberPosition): string {
        let killNumberUrl: string = null;
        switch (killNumberPosition) {
            case EnumKillNumberPosition.geWei:
                killNumberUrl = "http://cp.360.cn/shdd/shax?LotID=255401&ItemID=1005&TopCount=20&r=" + Math.random();
                break;
            case EnumKillNumberPosition.shiWei:
                killNumberUrl = "http://cp.360.cn/shdd/shax?LotID=255401&ItemID=1004&TopCount=20&r=" + Math.random();
                break;
            case EnumKillNumberPosition.baiWei:
                killNumberUrl = "http://cp.360.cn/shdd/shax?LotID=255401&ItemID=1003&TopCount=20&r=" + Math.random();
                break;
            default:
                killNumberUrl = "http://cp.360.cn/shdd/shax?LotID=255401&ItemID=1005&TopCount=20&r=" + Math.random();
                break;
        }
        return killNumberUrl;
    }

    /**
     *
     *
     * 最大遗漏号码
     */
    private getMaxMissNumberUrl(killNumberPosition: EnumKillNumberPosition): string {
        let url: string = null;
        switch (killNumberPosition) {
            case EnumKillNumberPosition.geWei:
                url = "http://chart.cp.360.cn/yltj/getchartdata?lotId=255401&chartType=dww5&spanType=0&span=30&r=" + Math.random() + "#roll_132";
                break;
            case EnumKillNumberPosition.shiWei:
                url = "http://chart.cp.360.cn/yltj/getchartdata?lotId=255401&chartType=dww4&spanType=0&span=30&r=" + Math.random() + "#roll_132";
                break;
            case EnumKillNumberPosition.baiWei:
                url = "http://chart.cp.360.cn/yltj/getchartdata?lotId=255401&chartType=dww3&spanType=0&span=30&r=" + Math.random() + "#roll_132";
                break;
            default:
                url = "http://chart.cp.360.cn/yltj/getchartdata?lotId=255401&chartType=dww5&spanType=0&span=30&r=" + Math.random() + "#roll_132";
                break;
        }
        return url;
    }

    /**
     *
     *
     * 获取杀号数据
     * @param killNumberPosition
     * @return 返回需要杀掉的号码数组
     */
    public getKillNumber(killNumberPosition: EnumKillNumberPosition): Promise<any> {
        return new Promise((resolve, reject) => {
            request(
                {
                    url: this.getKillNumberUrl(killNumberPosition),
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    try {
                        //获取图表中被杀的号码
                        let killedNumber = this.getKilledNumber(body);
                        log.info('排除%s位杀号计划号码：%s', killNumberPosition, killedNumber.toString());
                        resolve([killedNumber]);
                    } catch (e) {
                        log.error(e);
                        reject(e);
                    }
                });
        });
    }

    /**
     *
     *
     * 获取杀号图表中 被杀的号码
     */
    private getKilledNumber(body): string {
        let doc: any = cheerio.load(body);
        //杀号成功次数集合
        let successCountArray = [];
        //获取杀号正确次数
        let strongElements = doc('#bd > div.mod-shdd-bd.mod-kpshdd-hd > div.bd > div > div.shdd-table-cont > table > tbody > tr:nth-child(23) strong');

        for (let i = 0; i < strongElements.length; i++) {
            let item = strongElements[i];
            successCountArray.push(doc(item).text());
        }
        //最后一个
        successCountArray.pop();
        let maxCount = _.max(successCountArray);
        let maxIndex;

        //杀号正确的索引
        maxIndex = _.findIndex(successCountArray, (o) => {
            return o == maxCount;
        });

        //杀号集合
        let killNumberArray = [];
        let killNumberElements = doc('#bd > div.mod-shdd-bd.mod-kpshdd-hd > div.bd > div > div.shdd-table-cont > table > tbody > tr:nth-child(20) b');
        for (let i = 0; i < killNumberElements.length; i++) {
            let item = killNumberElements[i];
            killNumberArray.push(doc(item).text());
        }

        //保存杀号索引
        Analysis360Service.killNumberIndex = maxIndex;
        log.info('杀号正确最大次数：%s 所在图表索引列：%s 应杀号码：%s', maxCount, maxIndex, killNumberArray[maxIndex]);
        let killedNumber = String(killNumberArray[maxIndex]);
        return killedNumber;
    }


    /**
     *
     *
     * 获取最大遗漏号码
     * 返回需要杀掉号码组成的数组
     * @param {Number} numberCount 如果有值则取多个号码 ，无值则只取1个号码
     */
    public getMaxMissNumber(maxMissNumberPosition: EnumKillNumberPosition): Promise<any> {
        return new Promise((resolve, reject) => {
            request(
                {
                    url: this.getMaxMissNumberUrl(maxMissNumberPosition),
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    try {
                        //获取每个号码的当前遗漏值
                        let arr = this.getMissCountArray(body);
                        //获取指定遗漏值的号码 如果没有指定遗漏值 说明获取的是最大遗漏值的号码
                        let numberArray = this.getNumberArray(arr, 17);
                        log.info('%s位排除遗漏值最大号码：%s', maxMissNumberPosition, numberArray.toString());
                        resolve(numberArray);
                    } catch (e) {
                        log.error(e);
                        reject(e);
                    }
                });
        });
    }

    /**
     *
     * 获取每个号码的当前遗漏值
     * 返回值是数组类型  数组中的索引值就是对应的号码 数组中的值就是对应好的本期遗漏值
     */
    private getMissCountArray(body): Array<number> {
        let doc: any = cheerio.load(body);
        //0 本期遗漏
        let _0 = Number(doc('#data-tab > tr:nth-child(1) > td:nth-child(11)').text());
        //1 本期遗漏
        let _1 = Number(doc('#data-tab > tr:nth-child(2) > td:nth-child(11)').text());
        let _2 = Number(doc('#data-tab > tr:nth-child(3) > td:nth-child(11)').text());
        let _3 = Number(doc('#data-tab > tr:nth-child(4) > td:nth-child(11)').text());
        let _4 = Number(doc('#data-tab > tr:nth-child(5) > td:nth-child(11)').text());
        let _5 = Number(doc('#data-tab > tr:nth-child(6) > td:nth-child(11)').text());
        let _6 = Number(doc('#data-tab > tr:nth-child(7) > td:nth-child(11)').text());
        let _7 = Number(doc('#data-tab > tr:nth-child(8) > td:nth-child(11)').text());
        let _8 = Number(doc('#data-tab > tr:nth-child(9) > td:nth-child(11)').text());
        //9 本期遗漏
        let _9 = Number(doc('#data-tab > tr:nth-child(10) > td:nth-child(11)').text());

        return [_0, _1, _2, _3, _4, _5, _6, _7, _8, _9];
    }

    /**
     *
     *
     * 获取本期遗漏值最大的号码
     * 返回本期遗漏值最大的号码
     *@param {Number}  missCount 如果有值 ，则说明是指定遗漏值  如果没有指定遗漏值 说明获取的是最大遗漏值的号码
     */
    private getNumberArray(arr: Array<number>, missCount?: number): Array<string> {
        let resultArray: Array<string> = [];
        //最大的遗漏
        let maxMissCount = _.max(arr);
        if (missCount && missCount != 0) {
            //暂时把最大遗漏值设置为6
            maxMissCount = missCount;
        }

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            if (item >= maxMissCount) {
                resultArray.push(String(i));//索引就是要杀的遗漏号码
            }
        }

        log.info("遗漏值大于等于:%s 的号码有：%s", maxMissCount, resultArray.join(','));
        return resultArray;
    }
}