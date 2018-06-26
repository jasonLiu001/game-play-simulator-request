let LotteryDbService = require('../../../dist/services/dbservices/ORMService').LotteryDbService;
let AwardInfo = require('../../../dist/models/db/AwardInfo').AwardInfo;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;
let PlanResultInfo = require('../../../dist/models/db/PlanResultInfo').PlanResultInfo;
let MaxProfitInfo = require('../../../dist/models/db/MaxProfitInfo').MaxProfitInfo;
let moment = require('moment');


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

    xit('should get data from db', function (done) {
        LotteryDbService.getInvestInfo('20180520-028', 1)
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((e) => {
                console.error(e);
                done();
            });
    });

    xit('should create table award', function (done) {
        let maxProfitInfo = new MaxProfitInfo();
        maxProfitInfo.period = '20180520-028';
        maxProfitInfo.planType = 1;
        maxProfitInfo.originAccountBalance = 100;
        maxProfitInfo.maxAccountBalance = 120;
        maxProfitInfo.profitPercent = 0.2;
        maxProfitInfo.investTotalCount = 5;
        maxProfitInfo.createTime = moment().format('YYYY-MM-DD HH:mm:ss');

        let investInfo = new InvestInfo();
        investInfo.period = '20180520-028';
        investInfo.planType = 1;
        investInfo.investNumbers = "123";
        investInfo.investNumberCount = 1;
        investInfo.currentAccountBalance = 100;
        investInfo.awardMode = 100;
        investInfo.winMoney = 10;
        investInfo.status = 1;
        investInfo.isWin = 1;
        investInfo.investTime = moment().format('YYYY-MM-DD HH:mm:ss');


        let award = new AwardInfo();
        award.period = '20180520-028';
        award.openNumber = '45890';
        award.openTime = moment().format('YYYY-MM-DD HH:mm:ss');

        LotteryDbService.saveOrUpdateInvestInfo(investInfo)
            .then((result) => {
                console.log(result);
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

    it('should get all settings', function (done) {
        LotteryDbService.getSettingsInfoList()
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
