import Promise = require('bluebird');

let request = require('request');
/**
 *
 *
 * 爬虫接口 抓取开奖数据
 */
export interface IAwardCrawler {
    /**
     *
     *
     * 格式化期号 返回格式：20170809-045
     */
    formatPeriod(periodString: string): string ;

    /**
     *
     *
     * 开奖数据url
     * @param currentPeriod
     */
    getDataUrl(currentPeriod: string): string ;

    /**
     *
     *
     * 抓取的开奖数据结果
     */
    getAwardInfo(): Promise<any> ;
}