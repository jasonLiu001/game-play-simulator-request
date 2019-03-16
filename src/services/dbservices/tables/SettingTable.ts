import {sequelize} from "../../../global/GlobalSequelize";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


/**
 *
 * 参数设置表
 */
export const SettingTable = sequelize.define('settings', {
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