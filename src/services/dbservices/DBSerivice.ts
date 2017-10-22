import {SqliteService} from "./SqliteService";
import {Config} from "../../config/Config";
import Promise = require('bluebird');
import {AwardInfo} from "../../models/db/AwardInfo";
import {InvestInfo} from "../../models/db/InvestInfo";
import {CONST_AWARD_TABLE} from "../../models/db/CONST_AWARD_TABLE";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_PLAN_INVEST_NUMBERS_TABLE} from "../../models/db/CONST_PLAN_INVEST_NUMBERS_TABLE";
import {CONST_PLAN_TABLE} from "../../models/db/CONST_PLAN_TABLE";
import {CONST_PLAN_RESULT_TABLE} from "../../models/db/CONST_PLAN_RESULT_TABLE";
import {PlanInfo} from "../../models/db/PlanInfo";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";


let path = require('path');

export class LotteryDbService {
    public static sqliteService: SqliteService = new SqliteService(Config.dbPath);

    /**
     * 初始化数据库
     * CREATE TABLE IF NOT EXISTS award (period TEXT primary key, openNumber TEXT, openTime TEXT)
     * CREATE TABLE IF NOT EXISTS invest (period TEXT primary key, investNumbers TEXT, investNumberCount INTEGER, currentAccountBalance decimal(10,3), awardMode INTEGER, winMoney DECIMAL(10,3), status INTEGER, isWin INTEGER, investTime TEXT)
     * CREATE TABLE IF NOT EXISTS plan (period TEXT primary key, jiou_type TEXT, killplan_bai_wei TEXT,killplan_shi_wei TEXT,killplan_ge_wei TEXT,status INTERGER)
     * CREATE TABLE IF NOT EXISTS plan_result (period TEXT primary key, jiou_type INTEGER, killplan_bai_wei INTEGER,killplan_shi_wei INTEGER,killplan_ge_wei INTEGER,status INTERGER)
     * CREATE TABLE IF NOT EXISTS plan_invest_numbers (period TEXT primary key, jiou_type TEXT, killplan_bai_wei TEXT,killplan_shi_wei TEXT,killplan_ge_wei TEXT,status INTERGER)
     * @return {Bluebird<[any,any]>}
     */
    public static createLotteryTable(): Promise<any> {
        //开奖信息表
        let sqlCreateAwardTable = "CREATE TABLE IF NOT EXISTS " + CONST_AWARD_TABLE.tableName + " (" + CONST_AWARD_TABLE.period + " TEXT primary key, " + CONST_AWARD_TABLE.openNumber + " TEXT, " + CONST_AWARD_TABLE.openTime + " TEXT)";
        //投注记录表
        let sqlCreateInvestTable = "CREATE TABLE IF NOT EXISTS " + CONST_INVEST_TABLE.tableName + " (" + CONST_INVEST_TABLE.period + " TEXT primary key, " + CONST_INVEST_TABLE.investNumbers + " TEXT, " + CONST_INVEST_TABLE.investNumberCount + " INTEGER, " + CONST_INVEST_TABLE.currentAccountBalance + " decimal(10,3), " + CONST_INVEST_TABLE.awardMode + " INTEGER, " + CONST_INVEST_TABLE.winMoney + " DECIMAL(10,3), " + CONST_INVEST_TABLE.status + " INTEGER, " + CONST_INVEST_TABLE.isWin + " INTEGER, " + CONST_INVEST_TABLE.investTime + " TEXT)";
        //计划杀号记录表
        let sqlCreatePlanTable = "CREATE TABLE IF NOT EXISTS " + CONST_PLAN_TABLE.tableName + " (" + CONST_PLAN_TABLE.period + " TEXT primary key, " + CONST_PLAN_TABLE.jiOuType + " TEXT, " + CONST_PLAN_TABLE.baiWei + " TEXT," + CONST_PLAN_TABLE.shiWei + " TEXT," + CONST_PLAN_TABLE.geWei + " TEXT, " + CONST_PLAN_TABLE.status + " INTERGER)";
        //计划杀号结果表
        let sqlCreatePlanResultTable = "CREATE TABLE IF NOT EXISTS " + CONST_PLAN_RESULT_TABLE.tableName + " (" + CONST_PLAN_RESULT_TABLE.period + " TEXT primary key, " + CONST_PLAN_RESULT_TABLE.jiOuType + " INTEGER, " + CONST_PLAN_RESULT_TABLE.baiWei + " INTEGER," + CONST_PLAN_RESULT_TABLE.shiWei + " INTEGER," + CONST_PLAN_RESULT_TABLE.geWei + " INTEGER, " + CONST_PLAN_RESULT_TABLE.status + " INTERGER)";
        //计划投注号码表
        let sqlCreatePlanInvestNumbersTable = "CREATE TABLE IF NOT EXISTS " + CONST_PLAN_INVEST_NUMBERS_TABLE.tableName + " (" + CONST_PLAN_INVEST_NUMBERS_TABLE.period + " TEXT primary key, " + CONST_PLAN_INVEST_NUMBERS_TABLE.jiOuType + " TEXT, " + CONST_PLAN_INVEST_NUMBERS_TABLE.baiWei + " TEXT," + CONST_PLAN_INVEST_NUMBERS_TABLE.shiWei + " TEXT," + CONST_PLAN_INVEST_NUMBERS_TABLE.geWei + " TEXT, " + CONST_PLAN_INVEST_NUMBERS_TABLE.status + " INTERGER)";
        return Promise.all(
            [
                LotteryDbService.sqliteService.run(sqlCreateAwardTable),
                LotteryDbService.sqliteService.run(sqlCreateInvestTable),
                LotteryDbService.sqliteService.run(sqlCreatePlanTable),
                LotteryDbService.sqliteService.run(sqlCreatePlanResultTable),
                LotteryDbService.sqliteService.run(sqlCreatePlanInvestNumbersTable)
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
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<AwardInfo> {
        let sql = "INSERT OR REPLACE INTO " + CONST_AWARD_TABLE.tableName + " VALUES ($period,$openNumber,$openTime)";
        return LotteryDbService.sqliteService.prepare(sql,
            {
                $period: award.period,
                $openNumber: award.openNumber,
                $openTime: award.openTime
            })
            .then(() => {
                return award;
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
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<InvestInfo> {
        let sql = "INSERT OR REPLACE INTO " + CONST_INVEST_TABLE.tableName + " VALUES ($period,$investNumbers,$investNumberCount,$currentAccountBalance,$awardMode,$winMoney,$status,$isWin,$investTime)";
        return LotteryDbService.sqliteService.prepare(sql,
            {
                $period: investInfo.period,
                $investNumbers: investInfo.investNumbers,
                $investNumberCount: investInfo.investNumberCount,
                $currentAccountBalance: investInfo.currentAccountBalance,
                $awardMode: investInfo.awardMode,
                $winMoney: investInfo.winMoney,
                $isWin: investInfo.isWin,
                $status: investInfo.status,
                $investTime: investInfo.investTime
            })
            .then(() => {
                return investInfo;
            });
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    public static saveOrUpdateInvestInfoList(investInfoList: Array<InvestInfo>): Promise<Array<InvestInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let index in investInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestInfo(investInfoList[index]));
        }
        return Promise.all(promiseArray).then((results: Array<InvestInfo>) => {
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

    /**
     *
     * 关闭数据库连接
     * @return {Promise<any>}
     */
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

    /**
     *
     * 获取杀号计划实体
     * SELECT rowid AS id, * FROM plan where period=''
     * @param period
     */
    public static getPlanInfo(period: string): Promise<PlanInfo> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_PLAN_TABLE.tableName + " where period='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }

    /**
     *
     *
     * 保存或更新计划记录表
     * INSERT OR REPLACE INTO plan VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$killplan_ge_wei,$status)
     */
    public static saveOrUpdatePlanInfo(planInfo: PlanInfo): Promise<PlanInfo> {
        let sql = "INSERT OR REPLACE INTO " + CONST_PLAN_TABLE.tableName + " VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$killplan_ge_wei,$status)";
        return LotteryDbService.sqliteService.prepare(sql,
            {
                $period: planInfo.period,
                $jiou_type: planInfo.jiou_type,
                $killplan_bai_wei: planInfo.killplan_bai_wei,
                $killplan_shi_wei: planInfo.killplan_shi_wei,
                $killplan_ge_wei: planInfo.killplan_ge_wei,
                $status: planInfo.status
            })
            .then(() => {
                return planInfo;
            });
    }

    /**
     *
     * 获取杀号计划对错结果
     * SELECT rowid AS id, * FROM plan_result where period=''
     * @param period
     */
    public static getPlanResultInfo(period: string): Promise<PlanResultInfo> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_PLAN_RESULT_TABLE.tableName + " where period='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }


    /**
     *
     * 根据状态获取投注计划结果
     * SELECT r.*, a.openNumber FROM plan_result AS r INNER JOIN award AS a ON r.period = a.period WHERE r.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanResultInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_PLAN_RESULT_TABLE.tableName + " AS r INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON r." + CONST_PLAN_RESULT_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE r." + CONST_PLAN_RESULT_TABLE.status + " =" + status + "  order by a." + CONST_AWARD_TABLE.period + " asc";
        return LotteryDbService.sqliteService.all(sql);
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    public static saveOrUpdatePlanResultInfoList(planResultInfoList: Array<PlanResultInfo>): Promise<Array<PlanResultInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let index in planResultInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdatePlanResultInfo(planResultInfoList[index]));
        }
        return Promise.all(promiseArray).then((results: Array<PlanResultInfo>) => {
            return results;
        });
    }

    /**
     *
     *
     * 保存或更新计划记录投注结果表
     * INSERT OR REPLACE INTO plan_result VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$killplan_ge_wei,$status)
     */
    public static saveOrUpdatePlanResultInfo(planResultInfo: PlanResultInfo): Promise<PlanResultInfo> {
        let sql = "INSERT OR REPLACE INTO " + CONST_PLAN_RESULT_TABLE.tableName + " VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$ge_wei,$status)";
        return LotteryDbService.sqliteService.prepare(sql,
            {
                $period: planResultInfo.period,
                $jiou_type: planResultInfo.jiou_type,
                $killplan_bai_wei: planResultInfo.killplan_bai_wei,
                $killplan_shi_wei: planResultInfo.killplan_shi_wei,
                $killplan_ge_wei: planResultInfo.killplan_ge_wei,
                $status: planResultInfo.status
            })
            .then(() => {
                return planResultInfo;
            });
    }

    /**
     *
     * 获取杀号计划产生投注号码号码
     * SELECT rowid AS id, * FROM plan_result where period=''
     * @param period
     */
    public static getPlanInvestNumberesInfo(period: string): Promise<PlanInvestNumbersInfo> {
        let sql = "SELECT rowid AS id, * FROM " + CONST_PLAN_INVEST_NUMBERS_TABLE.tableName + " where period='" + period + "'";
        return LotteryDbService.sqliteService.get(sql);
    }

    /**
     *
     * 保存或更新计划投注号码表
     * INSERT OR REPLACE INTO plan_invest_numbers VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$killplan_ge_wei,$status)
     */
    public static saveOrUpdatePlanInvestNumbersInfo(planInvestNumbers: PlanInvestNumbersInfo): Promise<PlanInvestNumbersInfo> {
        let sql = "INSERT OR REPLACE INTO " + CONST_PLAN_INVEST_NUMBERS_TABLE.tableName + " VALUES ($period,$jiou_type,$killplan_bai_wei,$killplan_shi_wei,$killplan_ge_wei,$status)";
        return LotteryDbService.sqliteService.prepare(sql,
            {
                $period: planInvestNumbers.period,
                $jiou_type: planInvestNumbers.jiou_type,
                $killplan_bai_wei: planInvestNumbers.killplan_bai_wei,
                $killplan_shi_wei: planInvestNumbers.killplan_shi_wei,
                $killplan_ge_wei: planInvestNumbers.killplan_ge_wei,
                $status: planInvestNumbers.status
            })
            .then(() => {
                return planInvestNumbers;
            });
    }

    /**
     *
     * 根据状态获取投注号码
     * SELECT r.*, a.openNumber FROM plan_invest_numbers AS r INNER JOIN award AS a ON r.period = a.period WHERE r.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanInvestNumbersInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_PLAN_INVEST_NUMBERS_TABLE.tableName + " AS r INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON r." + CONST_PLAN_INVEST_NUMBERS_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE r." + CONST_PLAN_INVEST_NUMBERS_TABLE.status + " =" + status + "  order by a." + CONST_AWARD_TABLE.period + " asc";
        return LotteryDbService.sqliteService.all(sql);
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    public static saveOrUpdatePlanInvestNumbersInfoList(planInvestNumbersInfo: Array<PlanInvestNumbersInfo>): Promise<Array<PlanInvestNumbersInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let index in planInvestNumbersInfo) {
            promiseArray.push(LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo[index]));
        }
        return Promise.all(promiseArray).then((results: Array<PlanInvestNumbersInfo>) => {
            return results;
        });
    }
}