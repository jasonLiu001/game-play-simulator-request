import {SqliteService} from "./SqliteService";
import {Config} from "../../config/Config";
import Promise = require('bluebird');
import {AwardInfo} from "../../models/AwardInfo";
import {InvestInfo} from "../../models/InvestInfo";


let path = require('path');

export class LotteryDbService {
    public static sqliteService: SqliteService = new SqliteService(Config.dbPath);

    public static createLotteryTable(): Promise<any> {
        return Promise.all(
            [
                LotteryDbService.sqliteService.run("CREATE TABLE IF NOT EXISTS award (period TEXT primary key, openNumber TEXT, openTime TEXT)"),
                LotteryDbService.sqliteService.run("CREATE TABLE IF NOT EXISTS invest (period TEXT primary key, investNumbers TEXT, investNumberCount INTEGER, currentAccountBalance decimal(10,3), awardMode INTEGER, winMoney DECIMAL(10,3), status INTEGER, isWin INTEGER, investTime TEXT)")
            ]);
    }

    /**
     *
     *
     * 获取开奖信息
     * @param period
     * @return {Promise<any>}
     */
    public static getAwardInfo(period: string): Promise<AwardInfo> {
        return LotteryDbService.sqliteService.get("SELECT rowid AS id, * FROM award where period='" + period + "'");
    }


    /**
     *
     *
     * 保存或更新开奖数据
     * @param award
     */
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<any> {
        return LotteryDbService.sqliteService.prepare("INSERT OR REPLACE INTO award VALUES ($period,$openNumber,$openTime)", {
            $period: award.period,
            $openNumber: award.openNumber,
            $openTime: award.openTime
        });
    }

    /**
     *
     *
     * 获取投注信息
     * @param period
     */
    public static getInvestInfo(period: string): Promise<InvestInfo> {
        return LotteryDbService.sqliteService.get("SELECT rowid AS id, * FROM invest where period='" + period + "'");
    }

    /**
     *
     *
     * 保存或者更新投注信息
     */
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<any> {
        return LotteryDbService.sqliteService.prepare("INSERT OR REPLACE INTO invest VALUES ($period,$investNumbers,$investNumberCount,$currentAccountBalance,$awardMode,$winMoney,$status,$isWin,$investTime)", {
            $period: investInfo.period,
            $investNumbers: investInfo.investNumbers,
            $investNumberCount: investInfo.investNumberCount,
            $currentAccountBalance: investInfo.currentAccountBalance,
            $awardMode: investInfo.awardMode,
            $winMoney: investInfo.winMoney,
            $isWin: investInfo.isWin,
            $status: investInfo.status,
            $investTime: investInfo.investTime
        });
    }

    /**
     *
     * 保存或者更新投注信息
     */
    public static saveOrUpdateInvestInfoList(investInfoList: Array<InvestInfo>): Promise<Array<any>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let index in investInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestInfo(investInfoList[index]));
        }
        return Promise.all(promiseArray).then((results) => {
            return results;
        });
    }

    public static getInvestInfoHistory(historyCount: number): Promise<Array<any>> {
        return LotteryDbService.sqliteService.all("SELECT rowid AS id, * FROM invest limit " + historyCount);
    }

    public static closeDb(): Promise<any> {
        return LotteryDbService.sqliteService.closeDb();
    }

    /**
     *
     * 根据状态获取投注信息
     * @param status 0：未开奖，1：已开奖
     */
    public static getInvestInfoListByStatus(status: number): Promise<Array<any>> {
        return LotteryDbService.sqliteService.all("SELECT i.*, a.openNumber FROM invest AS i INNER JOIN award AS a ON i.period = a.period WHERE i.status = " + status + " order by a.period asc");
    }

    /**
     *
     *
     * 获取特定数量的开奖数据
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    public static getAwardInfoHistory(historyCount: number) {
        return LotteryDbService.sqliteService.all("SELECT rowid AS id, * FROM award ORDER BY period DESC LIMIT " + historyCount);
    }
}