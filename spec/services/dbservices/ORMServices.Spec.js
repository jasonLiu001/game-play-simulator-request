let ORMService = require('../../../dist/services/dbservices/ORMService').ORMService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;
let PlanResultInfo = require('../../../dist/models/db/PlanResultInfo').PlanResultInfo;

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
        let planResultInfoList = [];
        let planResultInfo = new PlanResultInfo();
        planResultInfo.period = '22';
        planResultInfo.status = 1;
        planResultInfoList.push(planResultInfo);

        let planResultInfo1 = new PlanResultInfo();
        planResultInfo1.period = '23';
        planResultInfo1.status = 1;
        planResultInfoList.push(planResultInfo1);

        ORMService.saveOrUpdatePlanResultInfoList(planResultInfoList)
            .then((res) => {
                console.log(res);
                done();
            });
    });

    it('should get history count records', function (done) {
        ORMService.getPlanInvestNumbersInfoListByStatus(1)
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((e) => {
                console.log(e);
                done();
            });
    });
});
