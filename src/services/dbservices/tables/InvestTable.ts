import {sequelize} from "../../../global/GlobalSequelize";
import {ConstVars} from "../../../global/ConstVars";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
import moment = require("moment");

/**
 *
 * 投注记录表
 */
export const InvestTable = sequelize.define('invest', {
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
        originAccountBalance: {//初始账户余额
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 1000
        },
        awardMode: {//元、角、分、厘 模式
            type: Sequelize.INTEGER
        },
        touZhuBeiShu: {//投注倍数
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        isUseReverseInvestNumbers: {//是否取相反的号码投注
            type: Sequelize.INTEGER,
            defaultValue: 0
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
                return moment(investTime).format(ConstVars.momentDateTimeFormatter);
            }
        },
        investDate: {//投注日期
            type: Sequelize.STRING,
            defaultValue: moment().format(ConstVars.momentDateFormatter)
        },
        investTimestamp: {//投注时间
            type: Sequelize.STRING,
            defaultValue: moment().format(ConstVars.momentTimeFormatter)
        }
    },
    {
        indexes: [
            {
                name: 'ix_investTimestamp',
                fields: ['investTimestamp']
            },
            {
                name: 'ix_investDate',
                fields: ['investDate']
            },
            {
                name: 'ix_investTime',
                fields: ['investTime']
            }
        ]
    });

/**
 *
 * 记录每个计划全天所有投注记录
 */
export const InvestTotalTable = sequelize.define('invest_total', {
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
        originAccountBalance: {//初始账户余额
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 1000
        },
        awardMode: {//元、角、分、厘 模式
            type: Sequelize.INTEGER
        },
        touZhuBeiShu: {//投注倍数
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        isUseReverseInvestNumbers: {//是否取相反的号码投注
            type: Sequelize.INTEGER,
            defaultValue: 0
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
                return moment(investTime).format(ConstVars.momentDateTimeFormatter);
            }
        },
        investDate: {//投注日期
            type: Sequelize.STRING,
            defaultValue: moment().format(ConstVars.momentDateFormatter)
        },
        investTimestamp: {//投注时间
            type: Sequelize.STRING,
            defaultValue: moment().format(ConstVars.momentTimeFormatter)
        }
    },
    {
        indexes: [
            {
                name: 'ix_investTimestamp',
                fields: ['investTimestamp']
            },
            {
                name: 'ix_investDate',
                fields: ['investDate']
            },
            {
                name: 'ix_investTime',
                fields: ['investTime']
            }
        ]
    });