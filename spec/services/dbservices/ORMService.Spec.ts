import "jasmine";
import {InvestTableService} from "../../../src/services/dbservices/services/InvestTableService";
import {EnumDbTableName} from "../../../src/models/EnumModel";
import {sequelize} from "../../../src/global/GlobalSequelize";

const Sequelize = require('sequelize');

const User = sequelize.define('User', {
    name: Sequelize.STRING,
    email: Sequelize.STRING
});

const Project = sequelize.define('Project', {
    name: Sequelize.STRING
});

//User.hasMany(Project);

describe('ORMService Test', () => {
    beforeEach((done) => {
        done();
    });

    xit('getInvestInfoListByStatus Test', (done) => {
        InvestTableService.getInvestInfoListStatusByTableName(EnumDbTableName.INVEST, 0)
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            });
    }, 60000);

    it('create db test', (done) => {
        sequelize
            .authenticate()
            .then(() => {
                console.log('Database connection has been established successfully.');
                //表存在时，执行修改操作，这个操作谨慎使用，如果修改已经存在的列名，会清空数据
                return sequelize.sync({
                    alter: true
                }).then(() => {
                    done();
                });
            })
    }, 60000);
});
