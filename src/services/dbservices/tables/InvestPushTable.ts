import {sequelize} from "../../../global/GlobalSequelize";
import {ConstVars} from "../../../global/ConstVars";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
import moment = require("moment");

/**
 *
 * 保存发送push的token
 */
export const InvestPush = sequelize.define('invest_push', {
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