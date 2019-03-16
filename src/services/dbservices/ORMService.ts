import Promise = require('bluebird');
import {SettingTableInitData, VendorTableInitData} from "../../global/ConstVars";
import {sequelize} from "../../global/GlobalSequelize";
import {SettingTable} from "./tables/SettingTable";
import {VendorTable} from "./tables/VendorTable";

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
}

