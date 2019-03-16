import Promise = require('bluebird');
import moment  = require('moment');
import {CONFIG_CONST} from "../../config/Config";
import {AwardInfo} from "../../models/db/AwardInfo";
import {InvestInfo} from "../../models/db/InvestInfo";
import {PlanInfo} from "../../models/db/PlanInfo";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {SettingsInfo, UpdateSettingsInfo} from "../../models/db/SettingsInfo";
import {InvestTotalInfo} from "../../models/db/InvestTotalInfo";
import {InvestPushInfo} from "../../models/db/InvestPushInfo";
import {VendorInfo} from "../../models/db/VendorInfo";
import {EnumDbTableName, EnumVendorType} from "../../models/EnumModel";
import {ConstVars, SettingTableInitData, VendorTableInitData} from "../../global/ConstVars";
import {sequelize} from "../../global/GlobalSequelize";
import {AwardTable} from "./tables/AwardTable";
import {InvestTable, InvestTotalTable} from "./tables/InvestTable";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 *
 * 计划相关的表模型定义
 */
class PlanBaseModelDefinition {
    /**
     *
     * 根据传递的类型返回新的实体
     * @param type
     */
    public static getModelDefinition(type) {
        return {
            period: {//期号
                type: Sequelize.STRING,
                primaryKey: true
            },
            jiou_type: {//杀奇偶类型
                type: type
            },
            killplan_bai_wei: {//杀号计划 杀百位
                type: type
            },
            killplan_shi_wei: {//杀号计划 杀十位
                type: type
            },
            killplan_ge_wei: {//杀号计划 杀个位
                type: type
            },
            missplan_bai_wei: {//遗漏计划 杀百位
                type: type
            },
            missplan_shi_wei: {//遗漏计划 杀十位
                type: type
            },
            missplan_ge_wei: {//遗漏计划 杀个位
                type: type
            },
            brokengroup_01_334: {//断组 3-3-4
                type: type
            },
            brokengroup_01_224: {//断组 2-2-4 断组
                type: type
            },
            brokengroup_01_125: {//断组 1-2-5 断组
                type: type
            },
            road012_01: {//杀012路类型
                type: type
            },
            number_distance: {//杀跨度
                type: type
            },
            sum_values: {//杀和值
                type: type
            },
            three_number_together: {//特殊号：三连
                type: type
            },
            killbaiwei_01: {//杀百位
                type: type
            },
            killshiwei_01: {//杀十位
                type: type
            },
            killgewei_01: {//杀个位
                type: type
            },
            bravenumber_6_01: {//6胆
                type: type
            },
            status: {//当前数据是否已经更新
                type: Sequelize.INTEGER
            }
        };
    }
}

/**
 *
 * 参数设置表
 */
const Setting = sequelize.define('settings', {
    key: {//参数名称
        type: Sequelize.STRING,
        primaryKey: true
    },
    orderId: {//排序id
        type: Sequelize.INTEGER
    },
    value: {//参数值
        type: Sequelize.STRING
    },
    group: {//分组名称
        type: Sequelize.STRING
    },
    isEnable: {//参数值是否可用 用作前端显示用 默认启用
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    desc: {//参数说明
        type: Sequelize.STRING
    },
    remark: {//备注 特别说明
        type: Sequelize.STRING
    }
});

/**
 *
 * Vendor 表 发送短信厂商 接收短信手机号的配置表
 */
const Vendor = sequelize.define('vendor', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    key: {//参数名称
        type: Sequelize.STRING,
    },
    value: {//参数值
        type: Sequelize.STRING,
    },
    desc: {//参数说明
        type: Sequelize.STRING
    },
    orderId: {//排序id
        type: Sequelize.INTEGER
    },
    type: {//类型
        type: Sequelize.STRING
    },
    createdTime: {//创建时间
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get: function () {
            const createdTime = this.getDataValue('createdTime');
            return moment(createdTime).format(ConstVars.momentDateTimeFormatter);
        }
    }
});

/**
 *
 * 保存发送push的token
 */
const InvestPush = sequelize.define('invest_push', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    deviceToken: {//发送push的device token
        type: Sequelize.STRING,
        primaryKey: true
    },
    imei: {//设备号
        type: Sequelize.STRING
    },
    pushPlatform: {//发送push的平台
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    pushVendorType: {//Push厂商类型
        type: Sequelize.STRING
    },
    tokenExpireTime: {//token过期时间
        type: Sequelize.DATE,
        get: function () {
            const createdTime = this.getDataValue('tokenExpireTime');
            return moment(createdTime).format(ConstVars.momentDateTimeFormatter);
        }
    },
    createdTime: {//创建时间
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get: function () {
            const createdTime = this.getDataValue('createdTime');
            return moment(createdTime).format(ConstVars.momentDateTimeFormatter);
        }
    }
});

/**
 * 计划投注号码表
 */
const Plan = sequelize.define('plan', PlanBaseModelDefinition.getModelDefinition(Sequelize.STRING));
/**
 *
 * 计划杀号结果表
 */
const PlanResult = sequelize.define('plan_result', PlanBaseModelDefinition.getModelDefinition(Sequelize.INTEGER));
/**
 *
 * 计划投注号码表
 */
const PlanInvestNumbers = sequelize.define('plan_invest_numbers', PlanBaseModelDefinition.getModelDefinition(Sequelize.TEXT));

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
                return Setting.findOne(
                    {
                        where: {key: 'originAccountBalance'},
                        raw: true
                    })
                    .then((res) => {
                        if (!res) {
                            //初始化Setting表数据
                            return Setting.bulkCreate(SettingTableInitData);
                        } else {
                            return res;
                        }
                    });
            })
            .then(() => {// Vendor表参数初始化 首先检查是否已经存在，存在则不再重复初始化
                return Vendor.findOne(
                    {
                        where: {type: 'TencentSMS'},
                        raw: true
                    })
                    .then((res) => {
                        if (!res) {
                            //初始化Vendor表数据
                            return Vendor.bulkCreate(VendorTableInitData);
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

    //region 开奖信息award表
    /**
     *
     * 获取开奖信息
     */
    public static getAwardInfo(period: string): Promise<AwardInfo> {
        return AwardTable.findOne(
            {
                where: {period: period},
                raw: true
            });
    }

    /**
     * 保存或更新开奖数据
     * @param award
     */
    public static saveOrUpdateAwardInfo(award: AwardInfo): Promise<AwardInfo> {
        return AwardTable.findOne(
            {
                where: {period: award.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return AwardTable.update(award,
                        {
                            where: {period: award.period}
                        })
                        .then(() => {
                            return award;
                        });
                } else {
                    return AwardTable.create(award)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存/更新开奖号码
     */
    public static saveOrUpdateAwardInfoList(awardList: Array<AwardInfo>): Promise<any> {
        let promiseArray: Array<Promise<any>> = [];
        for (let award of awardList) {
            promiseArray.push(LotteryDbService.saveOrUpdateAwardInfo(award));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新开奖数据
     * SELECT rowid AS id, * FROM award ORDER BY period DESC LIMIT 4
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    public static getAwardInfoHistory(historyCount: number) {
        return AwardTable.findAll({
            limit: historyCount,
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }

    //endregion

    //region 根据条件过滤后的 实际投注明细invest表
    /**
     *
     * 获取投注信息
     */
    public static getInvestInfo(period: string, planType: number): Promise<InvestInfo> {
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
    public static getMaxAndMinProfitFromInvest(dateArray: Array<string>, planType: number): Promise<any> {
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
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<InvestInfo> {
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
    public static saveOrUpdateInvestInfoList(investInfoList: Array<InvestInfo>): Promise<Array<InvestInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investInfo of investInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestInfo(investInfo));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    public static getInvestInfoHistory(planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
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
    public static getInvestInfoListByStatus(status: number): Promise<Array<any>> {
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
    public static getInvestTotalInfo(period: string, planType: number): Promise<InvestTotalInfo> {
        return InvestTotalTable.findOne({
            where: {period: period, planType: planType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新投注信息
     */
    public static saveOrUpdateInvestTotalInfo(investTotalInfo: InvestTotalInfo): Promise<InvestTotalInfo> {
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
    public static saveOrUpdateInvestTotalInfoList(investTotalInfoList: Array<InvestTotalInfo>): Promise<Array<InvestTotalInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investTotal of investTotalInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestTotalInfo(investTotal));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    public static getInvestTotalInfoHistory(planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
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
    public static getInvestTotalInfoListByStatus(status: number): Promise<Array<any>> {
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

    //region 计划plan表
    /**
     *
     * 获取杀号计划实体
     * SELECT rowid AS id, * FROM plan where period=''
     * @param period
     */
    public static getPlanInfo(period: string): Promise<PlanInfo> {
        return Plan.findOne({
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
        return Plan.findOne(
            {
                where: {period: planInfo.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return Plan.update(planInfo,
                        {
                            where: {period: planInfo.period}
                        })
                        .then(() => {
                            return planInfo;
                        });
                } else {
                    return Plan.create(planInfo)
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
        return PlanResult.findOne({
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
        return PlanResult.findAll({
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
        return PlanResult.findOne(
            {
                where: {period: planResultInfo.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return PlanResult.update(planResultInfo,
                        {
                            where: {period: planResultInfo.period}
                        })
                        .then(() => {
                            return planResultInfo;
                        });
                } else {
                    return PlanResult.create(planResultInfo)
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
        return PlanInvestNumbers.findOne({
            where: {period: period},
            raw: true
        });
    }

    /**
     *
     * 保存或更新计划投注号码表
     */
    public static saveOrUpdatePlanInvestNumbersInfo(planInvestNumbers: PlanInvestNumbersInfo): Promise<PlanInvestNumbersInfo> {
        return PlanInvestNumbers.findOne(
            {
                where: {period: planInvestNumbers.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return PlanInvestNumbers.update(planInvestNumbers,
                        {
                            where: {period: planInvestNumbers.period}
                        })
                        .then(() => {
                            return planInvestNumbers;
                        });
                } else {
                    return PlanInvestNumbers.create(planInvestNumbers)
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
        return Setting.findAll({
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
        return Setting.findOne(
            {
                where: {key: settingsInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return Setting.update(settingsInfo,
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
                    return Setting.create(settingsInfo)
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
        return Vendor.findAll({
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
        return Vendor.findOne({
            where: {type: enumVendorType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新厂商信息
     */
    public static saveOrUpdateVendorInfo(vendorInfo: VendorInfo): Promise<VendorInfo> {
        return Vendor.findOne(
            {
                where: {key: vendorInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return Vendor.update(vendorInfo,
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
                    return Vendor.create(vendorInfo)
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

    //region 公共方法
    /**
     *
     * 根据表名获取投注信息
     * @param {string} tableName 表名
     * @param {string} period 期号
     * @param {number} planType 计划类型
     */
    public static getInvestByTableName(tableName: string, period: string, planType: number): Promise<InvestInfo> {
        if (tableName == EnumDbTableName.INVEST) {
            return LotteryDbService.getInvestInfo(period, planType);
        } else if (tableName == EnumDbTableName.INVEST_TOTAL) {
            return LotteryDbService.getInvestTotalInfo(period, planType);
        } else {
            return Promise.resolve(null);
        }
    }

    /**
     *
     *  根据表名获取投注历史信息
     * @param {string} tableName 表名
     * @param {number} planType 计划类型
     * @param {number} historyCount 查询记录格式
     * @param {string} afterTime
     */
    public static getInvestHistoryByTableName(tableName: string, planType: number, historyCount: number, afterTime: string = ""): Promise<Array<any>> {
        if (tableName == EnumDbTableName.INVEST) {
            return LotteryDbService.getInvestInfoHistory(planType, historyCount, afterTime);
        } else if (tableName == EnumDbTableName.INVEST_TOTAL) {
            return LotteryDbService.getInvestTotalInfoHistory(planType, historyCount, afterTime);
        } else {
            return Promise.resolve([]);
        }
    }

    //endregion
}

