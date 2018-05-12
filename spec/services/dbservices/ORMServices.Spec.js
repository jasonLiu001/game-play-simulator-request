let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;

describe("ORMService Test", () => {
    let ormService;

    beforeEach((done) => {
        ormService = new ORMService();
        done();
    });

    xit('should drop all tables in db', function (done) {
        ormService.dropAllTables()
            .then(() => {
                done();
            });
    });

    it('should connect mysql db success', (done) => {
        ormService.dbConnectionTest()
            .then(() => {
                done();
            });

    });

    it('should create table award', function (done) {
        let award = new AwardInfo();
        award.period = String(new Date().getTime());
        award.openNumber = '';
        award.openTime = '';
        ormService.saveOrUpdateAwardInfo(award)
            .then((resultAward) => {
                console.log(resultAward.get());
                done();
            })
            .catch((e) => {
                console.error(e);
                done();
            });
    });
});
