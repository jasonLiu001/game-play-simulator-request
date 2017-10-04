let AbstractInvestBase = require('../../../dist/services/invest/AbstractInvestBase').AbstractInvestBase;
let LotteryDbService = require('../../../dist/services/dbservices/DBSerivice').LotteryDbService;
let InvestInfo = require('../../../dist/models/InvestInfo').InvestInfo;
let Config = require('../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../dist/config/Config').CONFIG_CONST;
describe("AbstractInvestBase Test", () => {
    let abstractInvestBase, investInfo, config, lotteryDbService;

    beforeEach((done) => {
        abstractInvestBase = new AbstractInvestBase();
        investInfo = new InvestInfo();
        config = new Config();
        lotteryDbService = new LotteryDbService();
        lotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    xit("updateCurrentAccountBalace test", () => {
        investInfo.isWin = 1;
        investInfo.currentAccountBalance = 34.79;
        investInfo.awardMode = Config.awardModel.feng;

        abstractInvestBase.updateCurrentAccountBalace(investInfo, config);

        let result = config.globalVariable.currentAccoutBalance - 16.34;

        let fixedNumber = result.toFixed(2);

        expect(fixedNumber).toBe(Number(investInfo.currentAccountBalance.toFixed(2)));
    });

    xit("saveCurrentAccountBalance test", () => {

    });

    it("calculateWinMoney test", (done) => {
        abstractInvestBase.calculateWinMoney(lotteryDbService, config)
            .then((result) => {
                expect(result).toBeDefined();
                done();
            })
            .catch((e) => {
                done();
            });
    }, 20000);
});