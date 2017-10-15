import {SqliteService} from "./SqliteService";
import {Config} from "../../config/Config";
import Promise = require('bluebird');
import {AwardInfo} from "../../models/AwardInfo";
import {InvestInfo} from "../../models/InvestInfo";
import {EnumAwardTable} from "../../models/db/EnumAwardTable";
import {EnumInvestTable} from "../../models/db/EnumInvestTable";


let path = require('path');

export class LotteryDbService {
    public static sqliteService: SqliteService = new SqliteService(Config.dbPath);

    public static createLotteryTable(): Promise<any> {
        //开奖信息表
        let sqlCreateAwardTable = "CREATE TABLE IF NOT EXISTS " + EnumAwardTable.tableName + " (" + EnumAwardTable.period + " TEXT primary key, " + EnumAwardTable.openNumber + " TEXT, " + EnumAwardTable.openTime + " TEXT)";
        //投注记录表
        let sqlCreateInvestTable = "CREATE TABLE IF NOT EXISTS " + EnumInvestTable.tableName + " (" + EnumInvestTable.period + " TEXT primary key, " + EnumInvestTable.investNumbers + " TEXT, " + EnumInvestTable.investNumberCount + " INTEGER, " + EnumInvestTable.currentAccountBalance + " decimal(10,3), " + EnumInvestTable.awardMode + " INTEGER, " + EnumInvestTable.winMoney + " DECIMAL(10,3), " + EnumInvestTable.status + " INTEGER, " + EnumInvestTable.isWin + " INTEGER, " + EnumInvestTable.investTime + " TEXT)";
        return Promise.all(
            [
                LotteryDbService.sqliteService.run(sqlCreateAwardTable),
                LotteryDbService.sqliteService.run(sqlCreateInvestTable)
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
        let sql = "SELECT rowid AS id, * FROM " + EnumAwardTable.tableName + " where " + EnumAwardTable.period + "='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }


    /**
     *
     *
     * 保存或更新开奖数据
     * @param award
     */
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<any> {
        let sql = "INSERT OR REPLACE INTO " + EnumAwardTable.tableName + " VALUES ($period,$openNumber,$openTime)";
        return LotteryDbService.sqliteService.prepare(sql, {
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
        let sql = "SELECT rowid AS id, * FROM " + EnumInvestTable.tableName + " where " + EnumInvestTable.period + "='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }

    /**
     *
     *
     * 保存或者更新投注信息
     */
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<any> {
        let sql = "INSERT OR REPLACE INTO " + EnumInvestTable.tableName + " VALUES ($period,$investNumbers,$investNumberCount,$currentAccountBalance,$awardMode,$winMoney,$status,$isWin,$investTime)";
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

    public static getInvestInfoHistory(historyCount: number): Promise<Array<any>> {
        let sql = "SELECT rowid AS id, * FROM " + EnumInvestTable.tableName + " limit " + historyCount;
        return LotteryDbService.sqliteService.all(sql);
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
        let sql = "SELECT i.*, a." + EnumAwardTable.openNumber + " FROM " + EnumInvestTable.tableName + " AS i INNER JOIN " + EnumAwardTable.tableName + " AS a ON i." + EnumInvestTable.period + " = a." + EnumAwardTable.period + " WHERE i." + EnumInvestTable.status + " = " + status + " order by a." + EnumAwardTable.period + " asc";
        return LotteryDbService.sqliteService.all(sql);
    }

    /**
     *
     *
     * 获取特定数量的开奖数据
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    public static getAwardInfoHistory(historyCount: number) {
        let sql = "SELECT rowid AS id, * FROM " + EnumAwardTable.tableName + " ORDER BY " + EnumAwardTable.period + " DESC LIMIT " + historyCount;
        return LotteryDbService.sqliteService.all(sql);
    }
}