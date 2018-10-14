let InvestService = require('../../../dist/services/invest/InvestService').InvestService;
let LotteryDbService = require('../../../dist/services/dbservices/ORMService').LotteryDbService;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;
let Config = require('../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../dist/config/Config').CONFIG_CONST;
let HttpRequestHeaders = require('../../../dist/models/EnumModel').HttpRequestHeaders;
let TimeService = require('../../../dist/services/time/TimeService').TimeService;

let Request = require('request');
let Promise = require('bluebird');
let moment = require('moment');

let cookie = Request.jar();
let request = Request.defaults(
    {
        jar: cookie,
        timeout: 20000,
        headers: HttpRequestHeaders,
        strictSSL: false
    });

describe("MockInvestService Test", () => {
    let investService, lotteryDbService;

    beforeEach((done) => {
        investService = new InvestService();
        lotteryDbService = new LotteryDbService();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });


    xit("executeAutoInvest test", () => {
        investService.executeAutoInvest(null);
    });

    it("loginAndInvest test", (done) => {
        let investInfo = new InvestInfo();
        //当前期号
        investInfo.period = TimeService.getCurrentPeriodNumber(new Date());
        investInfo.planType = "1";
        investInfo.investNumbers = "234";
        investInfo.currentAccountBalance = 1000;
        investInfo.investNumberCount = 1;
        investInfo.awardMode = 1000;//厘模式
        investInfo.touZhuBeiShu = 1;//1倍
        investInfo.isUseReverseInvestNumbers = 0;
        investInfo.winMoney = 0;
        investInfo.status = 0;
        investInfo.isWin = 0;
        investInfo.investTime = moment().format('YYYY-MM-DD HH:mm:ss');
        investInfo.investDate = moment().format('YYYY-MM-DD');
        investInfo.investTimestamp = moment().format('HH:mm:ss');

        investService.loginAndInvest(request, investInfo)
            .then((body) => {
                console.log(body);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    done();
                }
            });
    }, 20000000);
});