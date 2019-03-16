const Sequelize = require('sequelize');
export const sequelize = new Sequelize('reward', 'root', 'Fkwy+8ah', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {},
    logging: false,//不输出sql操作日志

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