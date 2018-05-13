let LotteryDbService = require('../../../dist/services/dbservices/ORMService').LotteryDbService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;
let PlanResultInfo = require('../../../dist/models/db/PlanResultInfo').PlanResultInfo;

describe("ORMService Test", () => {

    beforeEach((done) => {
        done();
    });

    xit('should drop all tables in db', function (done) {
        LotteryDbService.dropAllTables()
            .then(() => {
                done();
            });
    });

    xit('should connect mysql db success', (done) => {
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });

    });

    it('should create table award', function (done) {
        let award = new AwardInfo();
        award.period = String('1526181887096');
        award.openNumber = '';
        award.openTime = '';
        LotteryDbService.saveOrUpdateAwardInfo(award)
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

        LotteryDbService.saveOrUpdatePlanResultInfoList(planResultInfoList)
            .then((res) => {
                console.log(res);
                done();
            });
    });

    xit('should get history count records', function (done) {
        LotteryDbService.getPlanInvestNumbersInfoListByStatus(1)
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
