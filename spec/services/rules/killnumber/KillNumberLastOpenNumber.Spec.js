let KillNumberLastOpenNumber = require('../../../../dist/services/rules/killnumber/KillNumberLastOpenNumber').KillNumberLastOpenNumber;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;
let Config = require('../../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../../dist/config/Config').CONFIG_CONST;
let AwardInfo = require('../../../../dist/models/AwardInfo').AwardInfo;

describe("KillNumberLastOpenNumber Test", () => {
    let killNumberLastOpenNumber, config, lotteryDbService;

    beforeEach((done) => {
        killNumberLastOpenNumber = new KillNumberLastOpenNumber();
        config = new Config();
        lotteryDbService = new LotteryDbService();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });


    it("filterNumbers test", (done) => {
        killNumberLastOpenNumber.filterNumbers()
            .then((result) => {
                expect(result).toBeDefined();
                done();
            })
            .catch((err) => {
                if (err) console.error(err);
                done();
            });
    }, 60000);
});