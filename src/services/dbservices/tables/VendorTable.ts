import {sequelize} from "../../../global/GlobalSequelize";
import {ConstVars} from "../../../global/ConstVars";

const Sequelize = require('sequelize');
import moment = require("moment");

/**
 *
 * Vendor 表 发送短信厂商 接收短信手机号的配置表
 */
export const VendorTable = sequelize.define('vendor', {
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
        get() {
            const createdTime = this.getDataValue('createdTime');
            return moment(createdTime).format(ConstVars.momentDateTimeFormatter);
        }
    }
});
