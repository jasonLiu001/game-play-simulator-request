let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;

describe("ORMService Test", () => {
    let ormService;

    beforeEach((done) => {
        ormService = new ORMService();
        done();
    });

    /**
     *
     * 测试连接
     */
    it("db connection test", () => {
        ormService.test();
    });
});
