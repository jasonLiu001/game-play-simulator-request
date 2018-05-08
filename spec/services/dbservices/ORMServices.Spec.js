let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;

describe("ORMService Test", () => {

    beforeEach((done) => {
        done();
    });

    /**
     *
     * 测试连接
     */
    it("db connection test", (done) => {
        ORMService.test()
            .catch((e) => {
                done();
            });
    });
});
