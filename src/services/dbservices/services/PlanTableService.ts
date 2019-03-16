import Promise = require('bluebird');
import {PlanInvestNumbersTable, PlanResultTable, PlanTable} from "../tables/PlanTable";
import {PlanInvestNumbersInfo} from "../../../models/db/PlanInvestNumbersInfo";
import {PlanResultInfo} from "../../../models/db/PlanResultInfo";
import {PlanInfo} from "../../../models/db/PlanInfo";
import {sequelize} from "../../../global/GlobalSequelize";
import {LotteryDbService} from "../ORMService";

export class PlanTableService{
    //region 计划plan表
    /**
     *
     * 获取杀号计划实体
     * SELECT rowid AS id, * FROM plan where period=''
     * @param period
     */
    public static getPlanInfo(period: string): Promise<PlanInfo> {
        return PlanTable.findOne({
            where: {period: period},
            raw: true
        });
    }

    /**
     *
     *
     * 保存或更新计划记录表
     */
    public static saveOrUpdatePlanInfo(planInfo: PlanInfo): Promise<PlanInfo> {
        return PlanTable.findOne(
            {
                where: {period: planInfo.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return PlanTable.update(planInfo,
                        {
                            where: {period: planInfo.period}
                        })
                        .then(() => {
                            return planInfo;
                        });
                } else {
                    return PlanTable.create(planInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    //endregion

    //region 计划结果plan_result表
    /**
     *
     * 获取杀号计划对错结果
     * SELECT rowid AS id, * FROM plan_result where period=''
     * @param period
     */
    public static getPlanResultInfo(period: string): Promise<PlanResultInfo> {
        return PlanResultTable.findOne({
            where: {period: period},
            raw: true
        });
    }

    /**
     *
     * 根据状态获取投注计划结果
     * SELECT r.*, a.openNumber FROM plan_result AS r LEFT JOIN award AS a ON r.period = a.period WHERE r.status = 1 AND a.`openNumber`<>'' order by a.period DESC LIMIT 0,120
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanResultInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a.openNumber FROM plan_result AS r LEFT JOIN award AS a ON r.period = a.period WHERE r.status =" + status + " AND a.`openNumber`<>'' order by a.period DESC LIMIT 0,120";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
    }

    /**
     *
     * 获取特定数量的最新投注计划结果
     * SELECT rowid AS id, * FROM plan_result where status=1 ORDER BY period DESC limit 4
     * @param historyCount
     * @return {Promise<any>}
     */
    public static getPlanResultInfoHistory(historyCount: number): Promise<Array<any>> {
        return PlanResultTable.findAll({
            limit: historyCount,
            where: {status: 1},
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    public static saveOrUpdatePlanResultInfoList(planResultInfoList: Array<PlanResultInfo>): Promise<Array<PlanResultInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let planResultInfo of planResultInfoList) {
            promiseArray.push(PlanTableService.saveOrUpdatePlanResultInfo(planResultInfo));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     *
     * 保存或更新计划记录投注结果表
     */
    public static saveOrUpdatePlanResultInfo(planResultInfo: PlanResultInfo): Promise<PlanResultInfo> {
        return PlanResultTable.findOne(
            {
                where: {period: planResultInfo.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return PlanResultTable.update(planResultInfo,
                        {
                            where: {period: planResultInfo.period}
                        })
                        .then(() => {
                            return planResultInfo;
                        });
                } else {
                    return PlanResultTable.create(planResultInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    //endregion

    //region 计划产生号码plan_invest_numbers表
    /**
     *
     * 获取杀号计划产生投注号码号码
     * SELECT rowid AS id, * FROM plan_result where period=''
     * @param period
     */
    public static getPlanInvestNumberesInfo(period: string): Promise<PlanInvestNumbersInfo> {
        return PlanInvestNumbersTable.findOne({
            where: {period: period},
            raw: true
        });
    }

    /**
     *
     * 保存或更新计划投注号码表
     */
    public static saveOrUpdatePlanInvestNumbersInfo(planInvestNumbers: PlanInvestNumbersInfo): Promise<PlanInvestNumbersInfo> {
        return PlanInvestNumbersTable.findOne(
            {
                where: {period: planInvestNumbers.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return PlanInvestNumbersTable.update(planInvestNumbers,
                        {
                            where: {period: planInvestNumbers.period}
                        })
                        .then(() => {
                            return planInvestNumbers;
                        });
                } else {
                    return PlanInvestNumbersTable.create(planInvestNumbers)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     *  查询plan_invest_numbers表经常超时，这个需要处理一下
     *
     * 根据状态获取投注号码
     * SELECT r.*, a.openNumber FROM plan_invest_numbers AS r LEFT JOIN award AS a ON r.period = a.period WHERE r.status = 1 AND a.`openNumber`<>'' order by a.period DESC LIMIT 0,120
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanInvestNumbersInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a.openNumber FROM plan_invest_numbers AS r LEFT JOIN award AS a ON r.period = a.period WHERE r.status =" + status + " AND a.`openNumber`<>'' order by a.period DESC LIMIT 0,120";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
    }

    /**
     *
     * 批量保存或者更新投注信息
     */
    public static saveOrUpdatePlanInvestNumbersInfoList(planInvestNumbersInfoList: Array<PlanInvestNumbersInfo>): Promise<Array<PlanInvestNumbersInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let planInvestNumbersInfo of planInvestNumbersInfoList) {
            promiseArray.push(PlanTableService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo));
        }
        return Promise.all(promiseArray);
    }

    //endregion
}