import {sequelize} from "../../../global/GlobalSequelize";
import {ConstVars} from "../../../global/ConstVars";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
import moment = require("moment");

/**
 *
 *  开奖信息表
 */
export const AwardTable = sequelize.define('award', {
    period: {//开奖期号
        type: Sequelize.STRING,
        primaryKey: true
    },
    openNumber: {//开奖号码
        type: Sequelize.STRING
    },
    openTime: {//开奖时间
        type: Sequelize.STRING
    },
    createdTime: {//日期和时间
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get: function () {
            const createdTime = this.getDataValue('createdTime');
            return moment(createdTime).format(ConstVars.momentDateTimeFormatter);
        }
    },
    updateStatus: {//更新状态 1：自动更新 2：手工更新
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});