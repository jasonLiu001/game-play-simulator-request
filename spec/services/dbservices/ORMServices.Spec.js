let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;

describe("ORMService Test", () => {

    beforeEach((done) => {
        done();
    });

    xit('should drop all tables in db', function (done) {
        ORMService.dropAllTables()
            .then(() => {
                done();
            });
    });

    xit('should connect mysql db success', (done) => {
        ORMService.dbConnectionTest()
            .then(() => {
                done();
            });

    });

    xit('should create table award', function (done) {
        let award = new AwardInfo();
        award.period = String(new Date().getTime());
        award.openNumber = '';
        award.openTime = '';
        ORMService.saveOrUpdateAwardInfo(award)
            .then((resultAward) => {
                console.log(resultAward.get());
                done();
            })
            .catch((e) => {
                console.error(e);
                done();
            });
    });

    it('should be a plain object: getAwardInfo', function (done) {
        ORMService.getAwardInfo('1526138188114')
            .then((award) => {
                console.log(award);
                done();
            });
    });
});
