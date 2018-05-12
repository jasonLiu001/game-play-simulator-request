import {AwardInfo} from "../../models/db/AwardInfo";
import {InvestInfo} from "../../models/db/InvestInfo";
import {PlanInfo} from "../../models/db/PlanInfo";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";

const Sequelize = require('sequelize');
const sequelize = new Sequelize('reward', 'root', '123456', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00'
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
}, {
    freezeTableName: true//采用第一个参数作为表名，不会自动修改表名
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
        type: Sequelize.DECIMAL(10, 3)
    },
    awardMode: {//元、角、分、厘 模式
        type: Sequelize.INTEGER
    },
    winMoney: {//盈利金额
        type: Sequelize.DECIMAL(10, 3)
    },
    status: {//是否开奖标识
        type: Sequelize.INTEGER
    },
    isWin: {//是否中奖标识
        type: Sequelize.INTEGER
    },
    investTime: {//投注时间
        type: Sequelize.DATE
    }
}, {
    freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
    createdAt: false
});

/**
 * 计划投注号码表
 */
const Plan = sequelize.define('plan', PlanBaseModelDefinition.getModelDefinition(Sequelize.STRING), {
    freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
});
/**
 *
 * 计划杀号结果表
 */
const PlanResult = sequelize.define('plan_result', PlanBaseModelDefinition.getModelDefinition(Sequelize.INTEGER), {
    freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
});
/**
 *
 * 计划投注号码表
 */
const PlanInvestNumbers = sequelize.define('plan_invest_numbers', PlanBaseModelDefinition.getModelDefinition(Sequelize.TEXT), {
    freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
});

/**
 *
 * 数据库操作实体类
 */
export class ORMService {
    /**
     *
     * 测试数据库连接同时创建数据库
     */
    public dbConnectionTest() {
        //测试数据库连接
        return sequelize
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
                //表存在时，执行修改操作，这个操作谨慎使用，如果修改已经存在的列名，会清空数据
                // return sequelize.sync({
                //     alter: true
                // });
                return sequelize.sync();
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
    public dropAllTables() {
        return sequelize.drop();
    }

    /**
     * 保存或更新开奖数据
     * @param award
     */
    public saveOrUpdateAwardInfo(award: AwardInfo): Promise<AwardInfo> {
        return Award.create(award);
    }

    /**
     *
     * 保存或者更新投注信息
     */
    public saveOrUpdateInvestInfo(investInfo: InvestInfo): Promise<InvestInfo> {
        return Invest.create(investInfo);
    }

    /**
     *
     *
     * 保存或更新计划记录表
     */
    public saveOrUpdatePlanInfo(planInfo: PlanInfo): Promise<PlanInfo> {
        return Plan.create(planInfo);
    }

    /**
     *
     *
     * 保存或更新计划记录投注结果表
     */
    public saveOrUpdatePlanResultInfo(planResultInfo: PlanResultInfo): Promise<PlanResultInfo> {
        return PlanResult.create(planResultInfo);
    }

    /**
     *
     * 保存或更新计划投注号码表
     */
    public saveOrUpdatePlanInvestNumbersInfo(planInvestNumbers: PlanInvestNumbersInfo): Promise<PlanInvestNumbersInfo> {
        return PlanInvestNumbers.create(planInvestNumbers);
    }
}

