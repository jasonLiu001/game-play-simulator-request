import Promise = require('bluebird');
/**
 * @summary sqlite调用类
 * */
let sqlite3 = require('sqlite3').verbose(),
    path = require('path');

export class SqliteService {
    private dbInstance;

    constructor(fileName: string) {
        this.dbInstance = new sqlite3.Database(fileName);
    }

    run(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.serialize(() => {
                this.dbInstance.run(sql);
                resolve();
            });
        });
    }

    prepare(sql: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.serialize(() => {
                let stmt = this.dbInstance.prepare(sql);
                if (params) {
                    stmt.run(params);
                } else {
                    stmt.run();
                }
                stmt.finalize();
                resolve();
            });
        });
    }

    each(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.serialize(() => {
                this.dbInstance.each(sql, (err, row) => {
                    if (err) reject(err);
                    //这个回调函数每查询到一行就执行一次，会调用多次
                }, (err, rows) => {
                    //这个回调函数是所有行都查询完成后执行
                    resolve();
                });
            });
        });
    }

    all(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.serialize(() => {
                this.dbInstance.all(sql, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        });
    }

    get(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.serialize(() => {
                this.dbInstance.get(sql, (err, firstRow) => {
                    if (err) reject(err);
                    resolve(firstRow);
                });
            });
        });
    }

    closeDb(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbInstance.close((err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}