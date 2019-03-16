import Promise = require('bluebird');
import {PlanInfo} from "../../models/db/PlanInfo";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {SettingsInfo, UpdateSettingsInfo} from "../../models/db/SettingsInfo";
import {InvestPushInfo} from "../../models/db/InvestPushInfo";
import {VendorInfo} from "../../models/db/VendorInfo";
import {EnumVendorType} from "../../models/EnumModel";
import {SettingTableInitData, VendorTableInitData} from "../../global/ConstVars";
import {sequelize} from "../../global/GlobalSequelize";
import {SettingTable} from "./tables/SettingTable";
import {VendorTable} from "./tables/VendorTable";
import {InvestPush} from "./tables/InvestPushTable";
import {PlanInvestNumbersTable, PlanResultTable, PlanTable} from "./tables/PlanTable";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 *
 * 数据库操作实体类
 */
export class LotteryDbService {
    /**
     *
     * 测试数据库连接同时创建数据库
     */
    public static createLotteryTable(): Promise<any> {
        //测试数据库连接
        return sequelize
            .authenticate()
            .then(() => {
                console.log('Database connection has been established successfully.');
                //表存在时，执行修改操作，这个操作谨慎使用，如果修改已经存在的列名，会清空数据
                // return sequelize.sync({
                //     alter: true
                // });
                return sequelize.sync();
            })
            .then(() => {//设置Settings表参数初始化 首先检查是否已经存在，存在则不再重复初始化
                return SettingTable.findOne(
                    {
                        where: {key: 'originAccountBalance'},
                        raw: true
                    })
                    .then((res) => {
                        if (!res) {
                            //初始化Setting表数据
                            return SettingTable.bulkCreate(SettingTableInitData);
                        } else {
                            return res;
                        }
                    });
            })
            .then(() => {// Vendor表参数初始化 首先检查是否已经存在，存在则不再重复初始化
                return VendorTable.findOne(
                    {
                        where: {type: 'TencentSMS'},
                        raw: true
                    })
                    .then((res) => {
                        if (!res) {
                            //初始化Vendor表数据
                            return VendorTable.bulkCreate(VendorTableInitData);
                        } else {
                            return res;
                        }
                    });
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
                throw err;
            });
    }

    /**
     *
     * 删除数据库中所有表
     */
    public static dropAllTables() {
        return sequelize.drop();
    }

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
            promiseArray.push(LotteryDbService.saveOrUpdatePlanResultInfo(planResultInfo));
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
            promiseArray.push(LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo));
        }
        return Promise.all(promiseArray);
    }

    //endregion

    //region 参数设定Setting表
    /**
     *
     * 获取所有的参数设置信息
     */
    public static getSettingsInfoList(): Promise<Array<SettingsInfo>> {
        return SettingTable.findAll({
            order: [
                ['orderId', 'ASC']
            ],
            raw: true
        });
    }

    /**
     *
     * 保存或更新设置
     */
    public static saveOrUpdateSettingsInfo(settingsInfo: UpdateSettingsInfo): Promise<SettingsInfo> {
        return SettingTable.findOne(
            {
                where: {key: settingsInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return SettingTable.update(settingsInfo,
                        {
                            fields: ['value'],
                            where: {
                                key: settingsInfo.key
                            }
                        })
                        .then(() => {
                            return settingsInfo;
                        });
                } else {
                    return SettingTable.create(settingsInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    //endregion

    //region 厂商相关信息表
    /**
     *
     * 获取所有厂商信息
     */
    public static getVendorInfoList(): Promise<Array<VendorInfo>> {
        return VendorTable.findAll({
            order: [
                ['orderId', 'ASC']
            ],
            raw: true
        })
    }

    /**
     *
     * 获取厂商信息
     * @param enumVendorType 枚举值 包括 腾讯短信服务(TencentSMS)
     */
    public static getVendorInfo(enumVendorType: EnumVendorType): Promise<VendorInfo> {
        return VendorTable.findOne({
            where: {type: enumVendorType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新厂商信息
     */
    public static saveOrUpdateVendorInfo(vendorInfo: VendorInfo): Promise<VendorInfo> {
        return VendorTable.findOne(
            {
                where: {key: vendorInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return VendorTable.update(vendorInfo,
                        {
                            fields: ['value'],
                            where: {
                                key: vendorInfo.key
                            }
                        })
                        .then(() => {
                            return vendorInfo;
                        });
                } else {
                    return VendorTable.create(vendorInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    //endregion

    //region Push推送表
    /**
     *
     * 保存push信息
     */
    public static saveOrUpdateInvestPushInfo(investPush: InvestPushInfo): Promise<InvestPushInfo> {
        return InvestPush.findOne(
            {
                where: {
                    deviceToken: investPush.deviceToken,
                    pushPlatform: investPush.pushPlatform
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return InvestPush.update(investPush,
                        {
                            where: {
                                deviceToken: investPush.deviceToken,
                                pushPlatform: investPush.pushPlatform
                            },
                        })
                        .then(() => {
                            return investPush;
                        });
                } else {
                    return InvestPush.create(investPush)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存推送信息
     */
    public static saveOrUpdateInvestPushInfoList(investPushList: Array<InvestPushInfo>): Promise<Array<InvestPushInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investPush of investPushList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestPushInfo(investPush));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量历史记录
     * @param {number} historyCount
     * @param pushPlatform push厂商平台 参见枚举类EnumPushPlatformType
     * @param pushVendorType push厂商枚举 参见枚举类EnumPushVendorType
     */
    public static getInvestPushInfoHistory(historyCount: number, pushPlatform: number, pushVendorType: string): Promise<Array<any>> {
        return InvestPush.findAll({
            limit: historyCount,
            order: [
                ['createdTime', 'DESC']
            ],
            where: {
                pushPlatform: pushPlatform,
                pushVendorType: pushVendorType
            },
            raw: true
        });
    }

    //endregion
}

