let MockInvestService = require('../../../dist/services/invest/MockInvestService').MockInvestService;
let LotteryDbService = require('../../../dist/services/dbservices/DBSerivice').LotteryDbService;
let InvestInfo = require('../../../dist/models/InvestInfo').InvestInfo;
let Config = require('../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../dist/config/Config').CONFIG_CONST;

describe("MockInvestService Test", () => {
    let mockInvestService, investInfo, config, lotteryDbService;

    beforeEach((done) => {
        mockInvestService = new MockInvestService();
        investInfo = new InvestInfo();
        config = new Config();
        lotteryDbService = new LotteryDbService();
        lotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });


    it("executeAutoInvest test", () => {
        mockInvestService.executeAutoInvest(null, lotteryDbService, config);
    });
});