let InvestService = require('../../../dist/services/invest/InvestService').InvestService;
let LotteryDbService = require('../../../dist/services/dbservices/DBSerivice').LotteryDbService;
let InvestInfo = require('../../../dist/models/db/InvestInfo').InvestInfo;
let Config = require('../../../dist/config/Config').Config;
let EnumAwardMode = require('../../../dist/models/EnumModel').EnumAwardMode;
describe("AbstractInvestBase Test", () => {
    let abstractInvestBase, investInfo;

    beforeEach((done) => {
        abstractInvestBase = new InvestService();
        investInfo = new InvestInfo();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    /**
     *
     * 更新当前账户余额
     */
    xit("updateCurrentAccountBalace test", () => {
        investInfo.isWin = 1;
        investInfo.currentAccountBalance = 34.79;
        investInfo.awardMode = EnumAwardMode.feng;

        abstractInvestBase.updateCurrentAccountBalace(investInfo);

        let result = Config.currentAccountBalance - 16.34;

        let fixedNumber = result.toFixed(2);

        expect(fixedNumber).toBe(Number(investInfo.currentAccountBalance.toFixed(2)));
    });

    xit("calculateWinMoney test", (done) => {
        abstractInvestBase.calculateWinMoney()
            .then((result) => {
                expect(result).toBeDefined();
                done();
            })
            .catch((e) => {
                done();
            });
    }, 20000);

    /**
     *
     * 检查最大盈利金额是否达到设定目标
     */
    it("checkMaxWinMoney test", () => {
        //设置当前账号余额
        Config.currentAccountBalance = 743.2;
        abstractInvestBase.checkMaxWinMoney()
            .then((result) => {
                expect(result).toBe(false);
                done();
            })
            .catch((e) => {
                done();
            });
    }, 20000000);
});