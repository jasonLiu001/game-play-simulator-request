import {SqliteService} from "./SqliteService";
import {Config} from "../../config/Config";
import Promise = require('bluebird');
import {AwardInfo} from "../../models/db/AwardInfo";
import {InvestInfo} from "../../models/db/InvestInfo";
import {CONST_AWARD_TABLE} from "../../models/db/CONST_AWARD_TABLE";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";


let path = require('path');

export class LotteryDbService {
    public static sqliteService: SqliteService = new SqliteService(Config.dbPath);

    /**
     * 初始化数据库
     * CREATE TABLE IF NOT EXISTS award (period TEXT primary key, openNumber TEXT, openTime TEXT)
     * CREATE TABLE IF NOT EXISTS invest (period TEXT primary key, investNumbers TEXT, investNumberCount INTEGER, currentAccountBalance decimal(10,3), awardMode INTEGER, winMoney DECIMAL(10,3), status INTEGER, isWin INTEGER, investTime TEXT)
     * @return {Bluebird<[any,any]>}
     */
    public static createLotteryTable(): Promise<any> {
        //开奖信息表
        let sqlCreateAwardTable = "CREATE TABLE IF NOT EXISTS " + CONST_AWARD_TABLE.tableName + " (" + CONST_AWARD_TABLE.period + " TEXT primary key, " + CONST_AWARD_TABLE.openNumber + " TEXT, " + CONST_AWARD_TABLE.openTime + " TEXT)";
        //投注记录表
        let sqlCreateInvestTable = "CREATE TABLE IF NOT EXISTS " + CONST_INVEST_TABLE.tableName + " (" + CONST_INVEST_TABLE.period + " TEXT primary key, " + CONST_INVEST_TABLE.investNumbers + " TEXT, " + CONST_INVEST_TABLE.investNumberCount + " INTEGER, " + CONST_INVEST_TABLE.currentAccountBalance + " decimal(10,3), " + CONST_INVEST_TABLE.awardMode + " INTEGER, " + CONST_INVEST_TABLE.winMoney + " DECIMAL(10,3), " + CONST_INVEST_TABLE.status + " INTEGER, " + CONST_INVEST_TABLE.isWin + " INTEGER, " + CONST_INVEST_TABLE.investTime + " TEXT)";
        return Promise.all(
            [
                LotteryDbService.sqliteService.run(sqlCreateAwardTable),
                LotteryDbService.sqliteService.run(sqlCreateInvestTable)
            ]);
    }

    /**
     *
     * 获取开奖信息
     * SELECT rowid AS id, * FROM award where period=''
     * @param period
     * @return {Promise<any>}
     */
    public static getAwardInfo(period: string): Promise<AwardInfo> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_AWARD_TABLE.tableName + " where " + CONST_AWARD_TABLE.period + "='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }


    /**
     * 保存或更新开奖数据
     *INSERT OR REPLACE INTO award VALUES ($period,$openNumber,$openTime)
     * @param award
     */
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<any> {
        let sql = "INSERT OR REPLACE INTO " + CONST_AWARD_TABLE.tableName + " VALUES ($period,$openNumber,$openTime)";
        return LotteryDbService.sqliteService.prepare(sql, {
            $period: award.period,
            $openNumber: award.openNumber,
            $openTime: award.openTime
        });
    }

    /**
     *
     * 获取投注信息
     * SELECT rowid AS id, * FROM invest where period=''
     * @param period
     */
    public static getInvestInfo(period: string): Promise<InvestInfo> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_INVEST_TABLE.tableName + " where " + CONST_INVEST_TABLE.period + "='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }

    /**
     *
     * 保存或者更新投注信息
     * INSERT OR REPLACE INTO invest VALUES ($period,$investNumbers,$investNumberCount,$currentAccountBalance,$awardMode,$winMoney,$status,$isWin,$investTime)
     */
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<any> {
        let sql = "INSERT OR REPLACE INTO " + CONST_INVEST_TABLE.tableName + " VALUES ($period,$investNumbers,$investNumberCount,$currentAccountBalance,$awardMode,$winMoney,$status,$isWin,$investTime)";
        return LotteryDbService.sqliteService.prepare(sql, {
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

    /**
     *
     * 获取特定数量的投注记录
     * SELECT rowid AS id, * FROM invest limit 4
     * @param historyCount
     * @return {Promise<any>}
     */
    public static getInvestInfoHistory(historyCount: number): Promise<Array<any>> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_INVEST_TABLE.tableName + " limit " + historyCount;
        return LotteryDbService.sqliteService.all(sql);
    }

    public static closeDb(): Promise<any> {
        return LotteryDbService.sqliteService.closeDb();
    }

    /**
     *
     * 根据状态获取投注信息
     * SELECT i.*, a.openNumber FROM invest AS i INNER JOIN award AS a ON i.period = a.period WHERE i.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getInvestInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT i.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_INVEST_TABLE.tableName + " AS i INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON i." + CONST_INVEST_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE i." + CONST_INVEST_TABLE.status + " = " + status + " order by a." + CONST_AWARD_TABLE.period + " asc";
        return LotteryDbService.sqliteService.all(sql);
    }

    /**
     *
     * 获取特定数量的开奖数据
     * SELECT rowid AS id, * FROM award ORDER BY period DESC LIMIT 4
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    public static getAwardInfoHistory(historyCount: number) {
        let sql = "SELECT rowid AS id, * FROM " + CONST_AWARD_TABLE.tableName + " ORDER BY " + CONST_AWARD_TABLE.period + " DESC LIMIT " + historyCount;
        return LotteryDbService.sqliteService.all(sql);
    }
}