const Sequelize = require('sequelize');

export class ORMService {
    public static sequelize = new Sequelize('simpledb', 'root', '123456', {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    public static test() {
        return ORMService.sequelize
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
                return err;
            });
    }
}

