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
    //region Invest表
    /**
     *
     * 获取投注信息
     */
    static getInvestInfo(period: string, planType: number): Promise<InvestInfo> {
        return InvestTable.findOne({
            where: {period: period, planType: planType},
            raw: true
        });
    }

    /**
     *
     *
     * 获取某一时期内的最大利润和最小利润值
     * @param {Array} dateArray 支持多个日期
     * @param {number} planType
     * @returns {Bluebird<any>}
     */
    static getMaxAndMinProfitFromInvest(dateArray: Array<string>, planType: number): Promise<any> {
        let dateSql = '';//时间Sql
        dateArray.forEach((item, index) => {
            if (index < dateArray.length && dateArray.length > 1) {
                dateSql = dateSql + "'" + item + "',";
            } else {//最后一个不需要加逗号
                dateSql = dateSql + "'" + item + "'";
            }
        });

        let sql = "SELECT MAX(t.`currentAccountBalance`) AS maxAccountBalance,MIN(t.`currentAccountBalance`) AS minAccountBalance FROM invest t WHERE t.`investDate` in(" + dateSql + ") AND t.`planType`=" + planType + ' AND t.`investTimestamp`>\'10:00:00\' AND t.`investTimestamp`<\'22:00:00\'';
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
     * 保存或者更新投注信息
     */
    static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<InvestInfo> {
        return InvestTable.findOne(
            {
                where: {
                    period: investInfo.period,
                    planType: investInfo.planType
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return InvestTable.update(investInfo,
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
                    return InvestTable.create(investInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    static saveOrUpdateInvestInfoList(investInfoList: Array<InvestInfo>): Promise<Array<InvestInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investInfo of investInfoList) {
            promiseArray.push(InvestTableService.saveOrUpdateInvestInfo(investInfo));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    static getInvestInfoHistory(planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
        if (afterTime == "") {
            return InvestTable.findAll({
                limit: historyCount,
                where: {
                    planType: planType
                },
                order: [
                    ['period', 'DESC']
                ],
                raw: true
            });
        } else {
            return InvestTable.findAll({
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
     * 根据状态获取投注信息
     * SELECT i.*, a.openNumber FROM invest AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status =1 AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120
     * @param status 0：未开奖，1：已开奖
     */
    static getInvestInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT i.*, a.openNumber FROM invest AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = " + status + "  AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});

        ////这里的表关联暂时无法使用
        // return InvestTable.findAll({
        //     where: {
        //         status: status
        //     },
        //     order: [
        //         ['period', 'ASC']
        //     ],
        //     include: [{
        //         model: AwardTable,
        //         required: true,
        //         attributes: ['openNumber', 'openTime'],
        //         where: {period: Sequelize.col('award.period')}
        //     }],
        //     raw: true
        // });
    }

    //endregion

    //region 所有计划每局投注明细invest_total表
    /**
     *
     * 获取投注信息
     */
    static getInvestTotalInfo(period: string, planType: number): Promise<InvestTotalInfo> {
        return InvestTotalTable.findOne({
            where: {period: period, planType: planType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新投注信息
     */
    static saveOrUpdateInvestTotalInfo(investTotalInfo: InvestTotalInfo): Promise<InvestTotalInfo> {
        return InvestTotalTable.findOne(
            {
                where: {
                    period: investTotalInfo.period,
                    planType: investTotalInfo.planType
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return InvestTotalTable.update(investTotalInfo,
                        {
                            where: {
                                period: investTotalInfo.period,
                                planType: investTotalInfo.planType
                            }
                        })
                        .then(() => {
                            return investTotalInfo;
                        });
                } else {
                    return InvestTotalTable.create(investTotalInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    static saveOrUpdateInvestTotalInfoList(investTotalInfoList: Array<InvestTotalInfo>): Promise<Array<InvestTotalInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investTotal of investTotalInfoList) {
            promiseArray.push(InvestTableService.saveOrUpdateInvestTotalInfo(investTotal));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    static getInvestTotalInfoHistory(planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
        if (afterTime == "") {
            return InvestTotalTable.findAll({
                limit: historyCount,
                where: {planType: planType},
                order: [
                    ['period', 'DESC']
                ],
                raw: true
            });
        } else {
            return InvestTotalTable.findAll({
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
     * 根据状态获取投注信息
     * SELECT i.*, a.openNumber FROM invest_total AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = 1 AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120
     * @param status 0：未开奖，1：已开奖
     */
    static getInvestTotalInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT i.*, a.openNumber FROM invest_total AS i LEFT JOIN award AS a ON i.period = a.period WHERE i.status = " + status + " AND a.`openNumber`<>'' order by a.period desc LIMIT 0,120";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});

        ////这里的表关联暂时无法使用
        // return InvestTotalTable.findAll({
        //     where: {
        //         status: status
        //     },
        //     order: [
        //         ['period', 'ASC']
        //     ],
        //     include: [{
        //         model: AwardTable,
        //         required: true,
        //         attributes: ['openNumber', 'openTime'],
        //         where: {period: Sequelize.col('award.period')}
        //     }],
        //     raw: true
        // });
    }

    //endregion

    //region 公共方法
    /**
     *
     * 根据表名获取投注信息
     * @param {string} tableName 表名
     * @param {string} period 期号
     * @param {number} planType 计划类型
     */
    static getInvestByTableName(tableName: string, period: string, planType: number): Promise<InvestInfoBase> {
        if (tableName == EnumDbTableName.INVEST) {
            return InvestTableService.getInvestInfo(period, planType);
        } else if (tableName == EnumDbTableName.INVEST_TOTAL) {
            return InvestTableService.getInvestTotalInfo(period, planType);
        } else {
            return Promise.resolve(null);
        }
    }

    /**
     *
     * 查询invest或investTotal表投注记录
     * @param {InvestQuery} invest
     * @returns {Bluebird<InvestInfoBase>}
     */
    static getInvestListByTableName(invest: InvestQuery): Promise<InvestInfoBase> {
        if (invest.tableName == EnumDbTableName.INVEST) {
            //todo:查询invest表数据

        } else if (invest.tableName == EnumDbTableName.INVEST_TOTAL) {
            //todo:查询invest_total表数据
        }

        return Promise.resolve(null);
    }

    /**
     *
     * 查询利润列表
     */
    static getInvestProfitListByTableName(profitQuery: ProfitQuery) {
        if (profitQuery.tableName == EnumDbTableName.INVEST) {
            //todo:查询invest表数据

        } else if (profitQuery.tableName == EnumDbTableName.INVEST_TOTAL) {
            //todo:查询invest_total表数据
        }

        return Promise.resolve(null);
    }

    //endregion

}