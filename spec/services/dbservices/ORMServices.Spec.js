let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;

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
                console.log(resultAward);
                done();
            })
            .catch((e) => {
                console.error(e);
                done();
            });
    });

    xit('should be a plain object: saveOrUpdateInvestInfoList', function (done) {
        let investInfoList = [];
        let investInfo = new InvestInfo();
        investInfo.period = '22';
        investInfo.planType = 1;
        investInfoList.push(investInfo);

        let investInfo1 = new InvestInfo();
        investInfo1.period = '23';
        investInfo1.planType = 2;
        investInfoList.push(investInfo1);

        ORMService.saveOrUpdateInvestInfoList(investInfoList)
            .then((award) => {
                console.log(award);
                done();
            });
    });

    it('should get history count records', function (done) {
        ORMService.getInvestInfoHistory(2)
            .then((res) => {
                console.log(res);
                done();
            });
    });
});
