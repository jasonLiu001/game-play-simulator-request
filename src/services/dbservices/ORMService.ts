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
 *  开奖信息表
 */
const Award = sequelize.define('award', {
    period: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    openNumber: {
        type: Sequelize.STRING
    },
    openTime: {
        type: Sequelize.STRING
    }
});
/**
 *
 * 投注记录表
 */
const Invest = sequelize.define('invest', {});
/**
 * 计划投注号码表
 */
const Plan = sequelize.define('plan', {});
/**
 *
 * 计划杀号结果表
 */
const PlanResult = sequelize.define('plan_result');
/**
 *
 * 计划投注号码表
 */
const PlanInvestNumbers = sequelize.define('plan_invest_numbers');

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
    public saveOrUpdateAwardInfo(award: AwardInfo) {
        return Award.create(award);
    }

    /**
     *
     * 保存或者更新投注信息
     */
    public saveOrUpdateInvestInfo(investInfo: InvestInfo) {
        return Invest.create(investInfo);
    }

    /**
     *
     *
     * 保存或更新计划记录表
     */
    public saveOrUpdatePlanInfo(planInfo: PlanInfo) {
        return Plan.create(planInfo);
    }

    /**
     *
     *
     * 保存或更新计划记录投注结果表
     */
    public saveOrUpdatePlanResultInfo(planResultInfo: PlanResultInfo) {
        return PlanResult.create(planResultInfo);
    }

    /**
     *
     * 保存或更新计划投注号码表
     */
    public saveOrUpdatePlanInvestNumbersInfo(planInvestNumbers: PlanInvestNumbersInfo) {
        return PlanInvestNumbers.create(planInvestNumbers);
    }
}

