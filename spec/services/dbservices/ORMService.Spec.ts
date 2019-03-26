import "jasmine";
import {InvestTableService} from "../../../src/services/dbservices/services/InvestTableService";
import {EnumDbTableName} from "../../../src/models/EnumModel";
import {sequelize} from "../../../src/global/GlobalSequelize";

const Sequelize = require('sequelize');

const User = sequelize.define('User', {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
});


const Project = sequelize.define('Project', {
    projectName: Sequelize.STRING,
    //关联user表
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'userId'
        }
    }
});
User.hasMany(Project, {as: 'project', foreignKey: 'userId', sourceKey: 'userId'});
//Project.belongsTo(User, {foreignKey: 'userId', targetKey: 'userId'});

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

    xit('create db test', (done) => {
        sequelize
            .authenticate()
            .then(() => {
                console.log('Database connection has been established successfully.');
                //表存在时，执行修改操作，这个操作谨慎使用，如果修改已经存在的列名，会清空数据
                return sequelize.sync({
                    //force: true//删除所有表并重新创建新表
                }).then(() => {
                    //初始化测试数据表 数据
                    return User.bulkCreate(
                        [
                            {userId: 1, name: 'jack', email: 'jack@mail.com'},
                            {userId: 2, name: 'alias', email: 'alias@mail.com'},
                            {userId: 3, name: 'test', email: 'test@mail.com'}
                        ]
                    ).then(() => {
                        return Project.bulkCreate([
                            {projectName: 'english', userId: 1},
                            {projectName: 'earth', userId: 1},
                            {projectName: 'land', userId: 1},
                            {projectName: 'player', userId: 2},
                            {projectName: 'welcome', userId: 2},
                            {projectName: 'sit down', userId: 2}
                        ]);
                    });
                }).then(() => {
                    //关联查询测试
                    // return Project.findAll({
                    //     include: [{
                    //         model: User,
                    //         where: {userId: Sequelize.col('Project.userId')}
                    //     }],
                    //     raw: true
                    // });
                }).then(() => {
                    return User.findAll(
                        {
                            //attributes: ['userId'],//select属性列表
                            include: [{
                                as: 'project',
                                model: Project,
                                attributes: [['projectName', 'pro']],//列表的别名
                                where: {userId: Sequelize.col('User.userId')},
                                required: false//左连接查询
                            }],
                            raw: true
                        }
                    );
                }).then((res) => {
                    console.log(res);
                    done();
                });
            })
    }, 60000);
});
