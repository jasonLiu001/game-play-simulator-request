import Promise = require('bluebird');
import {Config} from "../../config/Config";
import moment  = require('moment');
import {AwardInfo} from "../../models/db/AwardInfo";
import {InvestInfo} from "../../models/db/InvestInfo";
import {PlanInfo} from "../../models/db/PlanInfo";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_AWARD_TABLE} from "../../models/db/CONST_AWARD_TABLE";
import {CONST_PLAN_RESULT_TABLE} from "../../models/db/CONST_PLAN_RESULT_TABLE";
import {CONST_PLAN_INVEST_NUMBERS_TABLE} from "../../models/db/CONST_PLAN_INVEST_NUMBERS_TABLE";
import {MaxProfitInfo} from "../../models/db/MaxProfitInfo";
import {SettingsInfo} from "../../models/db/SettingsInfo";

const Sequelize = require('sequelize');
const sequelize = new Sequelize('reward', 'root', 'Fkwy+8ah', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {},
    logging: false,//不输出sql操作日志

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
    define: {
        freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: false // 生成表的时候不带updatedAt, createdAt这两个字段
    }
});

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
 *  开奖信息表
 */
const Award = sequelize.define('award', {
    period: {//开奖期号
        type: Sequelize.STRING,
        primaryKey: true
    },
    openNumber: {//开奖号码
        type: Sequelize.STRING
    },
    openTime: {//开奖时间
        type: Sequelize.STRING
    }
});
/**
 *
 * 投注记录表
 */
const Invest = sequelize.define('invest', {
    period: {//期号
        type: Sequelize.STRING,
        primaryKey: true
    },
    planType: {//方案类型
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    investNumbers: {//投注号码
        type: Sequelize.TEXT
    },
    investNumberCount: {//投注号码总注数
        type: Sequelize.INTEGER
    },
    currentAccountBalance: {//当前账户余额
        type: Sequelize.DECIMAL(10, 2)
    },
    awardMode: {//元、角、分、厘 模式
        type: Sequelize.INTEGER
    },
    winMoney: {//盈利金额
        type: Sequelize.DECIMAL(10, 2)
    },
    status: {//是否开奖标识
        type: Sequelize.INTEGER
    },
    isWin: {//是否中奖标识
        type: Sequelize.INTEGER
    },
    investTime: {//投注日期和时间
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get: function () {
            const investTime = this.getDataValue('investTime');
            return moment(investTime).format('YYYY-MM-DD HH:mm:ss');
        }
    },
    investDate: {//投注日期
        type: Sequelize.STRING,
        defaultValue: moment().format('YYYY-MM-DD')
    },
    investTimestamp: {//投注时间
        type: Sequelize.STRING,
        defaultValue: moment().format('HH:mm:ss')
    }
});

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
    desc: {
        type: Sequelize.STRING
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
    public static createLotteryTable() {
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
            .then(() => {//设置参数初始化 首先检查是否已经存在，存在则不再重复初始化
                return Setting.findOne(
                    {
                        where: {key: 'originAccountBalance'},
                        raw: true
                    })
                    .then((res) => {
                        if (!res) {
                            return Setting.bulkCreate([
                                {key: 'isRealInvest', value: '0', orderId: '1', desc: '是否是真实投注 1:真实 0:模拟'},
                                {key: 'touZhuBeiShu', value: '2', orderId: '2', desc: '投注倍数'},
                                {key: 'originAccountBalance', value: '1000', orderId: '3', desc: '账户初始余额'},
                                {key: 'maxAccountBalance', value: '1200', orderId: '4', desc: '最大盈利目标金额'},
                                {key: 'minAccountBalance', value: '0', orderId: '5', desc: '最大亏损金额'},
                                {key: 'awardMode', value: '10', orderId: '6', desc: '元、角、分、厘模式'},
                                {key: 'currentSelectedInvestPlanType', value: '1', orderId: '7', desc: '当前选择的投注方案类型'}
                            ]);
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

    /**
     *
     * 获取开奖信息
     */
    public static getAwardInfo(period: string): Promise<AwardInfo> {
        return Award.findOne(
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
        return Award.findOne(
            {
                where: {period: award.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return Award.update(award,
                        {
                            where: {period: award.period}
                        })
                        .then(() => {
                            return award;
                        });
                } else {
                    return Award.create(award)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 获取投注信息
     */
    public static getInvestInfo(period: string, planType: number): Promise<InvestInfo> {
        return Invest.findOne({
            where: {period: period, planType: planType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新投注信息
     */
    public static saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<InvestInfo> {
        return Invest.findOne(
            {
                where: {
                    period: investInfo.period,
                    planType: investInfo.planType
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return Invest.update(investInfo,
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
                    return Invest.create(investInfo)
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
        for (let index in investInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdateInvestInfo(investInfoList[index]));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新投注记录
     */
    public static getInvestInfoHistory(planType: number, historyCount: number): Promise<Array<any>> {
        return Invest.findAll({
            limit: historyCount,
            where: {planType: planType},
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }

    /**
     *
     * 根据状态获取投注信息
     * SELECT i.*, a.openNumber FROM invest AS i INNER JOIN award AS a ON i.period = a.period WHERE i.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getInvestInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT i.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_INVEST_TABLE.tableName + " AS i INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON i." + CONST_INVEST_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE i." + CONST_INVEST_TABLE.status + " = " + status + " order by a." + CONST_AWARD_TABLE.period + " asc";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});

        ////这里的表关联暂时无法使用
        // return Invest.findAll({
        //     where: {
        //         status: status
        //     },
        //     order: [
        //         ['period', 'ASC']
        //     ],
        //     include: [{
        //         model: Award,
        //         required: true,
        //         attributes: ['openNumber', 'openTime'],
        //         where: {period: Sequelize.col('award.period')}
        //     }],
        //     raw: true
        // });
    }

    /**
     *
     * 获取特定数量的最新开奖数据
     * SELECT rowid AS id, * FROM award ORDER BY period DESC LIMIT 4
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    public static getAwardInfoHistory(historyCount: number) {
        return Award.findAll({
            limit: historyCount,
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }

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
     * SELECT r.*, a.openNumber FROM plan_result AS r INNER JOIN award AS a ON r.period = a.period WHERE r.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanResultInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_PLAN_RESULT_TABLE.tableName + " AS r INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON r." + CONST_PLAN_RESULT_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE r." + CONST_PLAN_RESULT_TABLE.status + " =" + status + "  order by a." + CONST_AWARD_TABLE.period + " asc";
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
        for (let index in planResultInfoList) {
            promiseArray.push(LotteryDbService.saveOrUpdatePlanResultInfo(planResultInfoList[index]));
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
     * 根据状态获取投注号码
     * SELECT r.*, a.openNumber FROM plan_invest_numbers AS r INNER JOIN award AS a ON r.period = a.period WHERE r.status =1  order by a.period asc
     * @param status 0：未开奖，1：已开奖
     */
    public static getPlanInvestNumbersInfoListByStatus(status: number): Promise<Array<any>> {
        let sql = "SELECT r.*, a." + CONST_AWARD_TABLE.openNumber + " FROM " + CONST_PLAN_INVEST_NUMBERS_TABLE.tableName + " AS r INNER JOIN " + CONST_AWARD_TABLE.tableName + " AS a ON r." + CONST_PLAN_INVEST_NUMBERS_TABLE.period + " = a." + CONST_AWARD_TABLE.period + " WHERE r." + CONST_PLAN_INVEST_NUMBERS_TABLE.status + " =" + status + "  order by a." + CONST_AWARD_TABLE.period + " asc";
        return sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
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
        return Promise.all(promiseArray);
    }

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
    public static saveOrUpdateSettingsInfo(settingsInfo: SettingsInfo): Promise<SettingsInfo> {
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
}

