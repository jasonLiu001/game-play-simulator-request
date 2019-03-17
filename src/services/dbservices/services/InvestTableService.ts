import Promise = require('bluebird');
import {CONFIG_CONST} from "../../../config/Config";
import {InvestTable, InvestTotalTable} from "../tables/InvestTable";
import {sequelize} from "../../../global/GlobalSequelize";
import {InvestInfo} from "../../../models/db/InvestInfo";
import {EnumDbTableName} from "../../../models/EnumModel";
import {InvestTotalInfo} from "../../../models/db/InvestTotalInfo";
import {InvestQuery} from "../../../models/query/InvestQuery";
import {InvestInfoBase} from "../../../models/db/InvestInfoBase";
import {ProfitQuery} from "../../../models/query/ProfitQuery";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export class InvestTableService {
    /**
     *
     * 获取某一时期内的最大利润和最小利润值
     */
    static getMaxAndMinProfitByTableName(tableName: string, dateArray: Array<string>, planType: number): Promise<any> {
        let dateSql = '';//时间Sql
        dateArray.forEach((item, index) => {
            if (index < dateArray.length && dateArray.length > 1) {
                dateSql = dateSql + "'" + item + "',";
            } else {//最后一个不需要加逗号
                dateSql = dateSql + "'" + item + "'";
            }
        });

        let sql = "SELECT MAX(t.`currentAccountBalance`) AS maxAccountBalance,MIN(t.`currentAccountBalance`) AS minAccountBalance FROM " + tableName + " AS t WHERE t.`investDate` in(" + dateSql + ") AND t.`planType`=" + planType + ' AND t.`investTimestamp`>\'10:00:00\' AND t.`investTimestamp`<\'22:00:00\'';
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT})
            .then((results: Array<any>) => {
                return {
                    maxAccountBalance: results[0].maxAccountBalance || CONFIG_CONST.originAccountBalance,
                    minAccountBalance: results[0].minAccountBalance || CONFIG_CONST.originAccountBalance
                }
            });
    }

    /**
     *
     * 根据状态获取投注信息
     * SELECT i.*, a.openNumber FROM invest_total AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = 1 AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120
     */
    static getInvestTotalInfoListStatusByTableName(tableName: string, status: number): Promise<Array<any>> {
        let sql = "SELECT i.*, a.openNumber FROM " + tableName + " AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = " + status + " AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    static getInvestInfoHistoryByTableName(tableName: EnumDbTableName, planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
        let tableInstance: any = InvestTableService.getQueryTableInstance(tableName);
        if (afterTime == "") {
            return tableInstance.findAll({
                limit: historyCount,
                where: {planType: planType},
                order: [
                    ['period', 'DESC']
                ],
                raw: true
            });
        } else {
            return tableInstance.findAll({
                limit: historyCount,
                where: {
                    planType: planType,
                    investTime: {
                        [Op.gt]: afterTime
                    }
                },
                order: [
                    ['period', 'DESC']
                ],
                raw: true
            });
        }
    }

    /**
     *
     * 保存或者更新投注信息
     */
    static saveOrUpdateInvestInfoListByTableName(tableName: EnumDbTableName, investInfoList: Array<InvestInfoBase>): Promise<Array<InvestInfoBase>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investInfo of investInfoList) {
            promiseArray.push(InvestTableService.saveOrUpdateInvestInfoByTableName(tableName, investInfo));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 保存或者更新投注信息
     */
    static saveOrUpdateInvestInfoByTableName(tableName: EnumDbTableName, investInfo: InvestInfoBase): Promise<InvestInfoBase> {
        let tableInstance: any = InvestTableService.getQueryTableInstance(tableName);
        return tableInstance.findOne(
            {
                where: {
                    period: investInfo.period,
                    planType: investInfo.planType
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return tableInstance.update(investInfo,
                        {
                            where: {
                                period: investInfo.period,
                                planType: investInfo.planType
                            }
                        })
                        .then(() => {
                            return investInfo;
                        });
                } else {
                    return tableInstance.create(investInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 查询invest或invest_total表投注详情
     * @param {string} tableName 表名
     * @param {string} period 期号
     * @param {number} planType 计划类型
     */
    static getInvestInfoByTableName(tableName: string, period: string, planType: number): Promise<InvestInfoBase> {
        let tableInstance: any = InvestTableService.getQueryTableInstance(tableName);
        return tableInstance.findOne({
            where: {period: period, planType: planType},
            raw: true
        });
    }

    /**
     *
     * 查询invest或investTotal表投注记录
     * @param {InvestQuery} invest
     * @returns {Bluebird<InvestInfoBase>}
     */
    static getInvestListByTableName(invest: InvestQuery): Promise<Array<InvestQuery>> {
        let tableInstance: any = InvestTableService.getQueryTableInstance(invest.tableName);

        //动态 where 查询条件
        let whereCondition: any;
        if (invest.startTime != "" && invest.startTime != undefined) {
            whereCondition = {
                planType: invest.planType,
                investTimestamp: (invest.startTime != "" && invest.startTime != undefined) ? {
                    [Op.gte]: invest.startTime,
                    [Op.lte]: invest.endTime
                } : null
            };
        } else {
            whereCondition = {
                planType: invest.planType
            };
        }

        //返回查询结果 指定查询字段
        return tableInstance.findAll({
            attributes: ['period', 'planType', 'investNumberCount', 'currentAccountBalance', 'isUseReverseInvestNumbers', 'status', 'isWin', 'investTime'],
            offset: (invest.pageIndex - 1) * invest.pageSize,
            limit: invest.pageSize,
            where: whereCondition,
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }

    /**
     *
     * 查询利润列表
     */
    static getInvestProfitListByTableName(profitQuery: ProfitQuery): Promise<Array<any>> {
        if (profitQuery.tableName == EnumDbTableName.INVEST) {
            //todo:查询invest表数据

        } else if (profitQuery.tableName == EnumDbTableName.INVEST_TOTAL) {
            //todo:查询invest_total表数据
        }

        return Promise.resolve(null);
    }

    /**
     *
     * 获取查询表实例
     */
    private static getQueryTableInstance(tableName: string): any {
        let tableInstance: any = InvestTable;
        if (tableName == EnumDbTableName.INVEST) {
            tableInstance = InvestTable;
        } else if (tableName == EnumDbTableName.INVEST_TOTAL) {
            tableInstance = InvestTotalTable;
        }
        return tableInstance;
    }
}