const Sequelize = require('sequelize');
const Op = Sequelize.Op;
export const sequelize = new Sequelize('reward', 'root', 'Fkwy+8ah', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {},
    //logging: console.log, //输出sql执行日志
    logging: false,//不输出sql操作日志
    //问题：Deprecation warning for String based operators
    //解决方案：https://github.com/sequelize/sequelize/issues/8417#issuecomment-335124373
    operatorsAliases: Op, // use Sequelize.Op

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
    define: {
        freezeTableName: true,//采用第一个参数作为表名，不会自动修改表名
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: false // 生成表的时候不带updatedAt, createdAt这两个字段
    }
});
