import BlueBirdPromise = require('bluebird');
import {CONFIG_CONST} from "../../../config/Config";
import {InvestTable, InvestTotalTable} from "../tables/InvestTable";
import {sequelize} from "../../../global/GlobalSequelize";
import {EnumDbTableName} from "../../../models/EnumModel";
import {InvestQuery} from "../../../models/query/InvestQuery";
import {InvestInfoBase} from "../../../models/db/InvestInfoBase";
import {ProfitQuery} from "../../../models/query/ProfitQuery";
import {InvestInfoGroupByPeriodViewModel} from "../../../models/viewmodel/InvestInfoGroupByPeriod";

const Sequelize = require('sequelize');
const Enumerable = require('linq');
const Op = Sequelize.Op;

export class InvestTableService {
    /**
     *
     * 获取某一时期内的最大利润和最小利润值
     */
    static getMaxAndMinProfitByTableName(tableName: string, dateArray: Array<string>, planType: number): BlueBirdPromise<any> {
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
    static getInvestInfoListStatusByTableName(tableName: string, status: number): BlueBirdPromise<Array<any>> {
        let sql = "SELECT i.*, a.openNumber FROM " + tableName + " AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = :status AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120";
        return sequelize.query(sql, {replacements: {status: status}, type: sequelize.QueryTypes.SELECT});
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    static getInvestInfoHistoryByTableName(tableName: string, planType: number, historyCount: number, afterTime: string = ""): BlueBirdPromise<Array<any>> {
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
    static saveOrUpdateInvestInfoListByTableName(tableName: string, investInfoList: Array<InvestInfoBase>): BlueBirdPromise<Array<InvestInfoBase>> {
        let promiseArray: Array<BlueBirdPromise<any>> = [];
        for (let investInfo of investInfoList) {
            promiseArray.push(InvestTableService.saveOrUpdateInvestInfoByTableName(tableName, investInfo));
        }
        return BlueBirdPromise.all(promiseArray);
    }

    /**
     *
     * 保存或者更新投注信息
     */
    static saveOrUpdateInvestInfoByTableName(tableName: string, investInfo: InvestInfoBase): BlueBirdPromise<InvestInfoBase> {
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
    static getInvestInfoByTableName(tableName: string, period: string, planType: number): BlueBirdPromise<InvestInfoBase> {
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
    static getInvestListByTableName(invest: InvestQuery): BlueBirdPromise<Array<InvestInfoBase>> {
        let tableInstance: any = InvestTableService.getQueryTableInstance(invest.tableName);

        //动态 where 查询条件
        let whereCondition: any;
        if (invest.startTime != "" && invest.startTime != undefined && !isNaN(invest.planType)) {
            whereCondition = {
                planType: invest.planType,
                investTimestamp: {
                    [Op.gte]: invest.startTime,
                    [Op.lte]: invest.endTime
                }
            };
        } else if (invest.startDate != "" && invest.startDate != undefined && !isNaN(invest.planType)) {
            whereCondition = {
                planType: invest.planType,
                investDate: {
                    [Op.gte]: invest.startDate,
                    [Op.lte]: invest.endDate
                }
            };
        } else if (invest.startDateTime != "" && invest.startDateTime != undefined && !isNaN(invest.planType)) {
            whereCondition = {
                planType: invest.planType,
                investTime: {
                    [Op.gte]: invest.startDateTime,
                    [Op.lte]: invest.endDateTime
                }
            };
        } else if (!isNaN(invest.planType)) {
            whereCondition = {
                planType: invest.planType
            };
        }

        //返回查询结果 指定查询字段
        let investQueryList: BlueBirdPromise<Array<InvestInfoBase>> = tableInstance.findAll({
            attributes: ['period', 'planType', 'investNumberCount', 'currentAccountBalance', 'originAccountBalance', 'awardMode', 'touZhuBeiShu', 'isUseReverseInvestNumbers', 'winMoney', 'status', 'isWin', 'investTime', 'investDate', 'investTimestamp'],
            offset: (invest.pageIndex - 1) * invest.pageSize,
            limit: invest.pageSize,
            where: whereCondition,
            order: [
                ['period', 'DESC']
            ],
            raw: false
        });
        //没有传递方案类型 返回4中方案汇总数据
        if (isNaN(invest.planType)) {
            return InvestTableService.getAllInvestInfoList(investQueryList);
        }

        return investQueryList;
    }

    /**
     *
     *
     * 返回全部的方案列表
     */
    private static getAllInvestInfoList(investQueryList: BlueBirdPromise<Array<InvestInfoBase>>): BlueBirdPromise<Array<any>> {
        return investQueryList
            .then((investArray: Array<InvestInfoBase>) => {
                //提取period列表
                let periodList: Array<string> = Enumerable.from(investArray)
                    .select(function (item) {
                        return item.period;
                    })
                    .distinct()
                    .toArray();

                //接口返回数据
                let investInfoArray: Array<InvestInfoGroupByPeriodViewModel> = [];

                periodList.forEach(function (period) {
                    let periodGroup: InvestInfoGroupByPeriodViewModel = new InvestInfoGroupByPeriodViewModel();
                    periodGroup.period = period;
                    periodGroup.investInfoList = Enumerable.from(investArray)
                        .where(function (investInfo) {
                            return investInfo.period == period;
                        })
                        .toArray();

                    investInfoArray.push(periodGroup);
                });

                return investInfoArray;
            });
    }

    /**
     *
     * 查询利润列表
     */
    static getInvestProfitListByTableName(profitQuery: ProfitQuery): BlueBirdPromise<Array<any>> {
        let whereCondition: string = "";
        if (profitQuery.startTime != undefined && profitQuery.startTime != '') {
            whereCondition = " AND R.`investTimestamp`>=:startTime AND R.`investTimestamp`<=:endTime ";
        }

        let sql = "SELECT A.investDate,MIN(A.currentAccountBalance) minprofit,MAX(A.currentAccountBalance) maxprofit FROM (SELECT * FROM invest R WHERE R.planType=:planType " + whereCondition + ") A GROUP BY A.investDate ORDER BY A.investDate DESC LIMIT :pageIndex,:pageSize";
        return sequelize.query(sql,
            {
                replacements: {
                    planType: profitQuery.planType,
                    pageIndex: (profitQuery.pageIndex - 1) * profitQuery.pageSize,
                    pageSize: profitQuery.pageSize,
                    startTime: profitQuery.startTime,
                    endTime: profitQuery.endTime
                },
                type: sequelize.QueryTypes.SELECT
            });
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
