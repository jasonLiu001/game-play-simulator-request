let KillNumberGeWei = require('../../../../dist/services/rules/killnumber/KillNumberGeWei').KillNumberGeWei;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;
let Config = require('../../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../../dist/config/Config').CONFIG_CONST;
let AwardInfo = require('../../../../dist/models/AwardInfo').AwardInfo;

describe("KillNumberGeWei Test", () => {
    let killNumberGeWei, config, lotteryDbService;

    beforeEach((done) => {
        killNumberGeWei = new KillNumberGeWei();
        config = new Config();
        lotteryDbService = new LotteryDbService();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it("filterNumbers test", (done) => {
        killNumberGeWei.filterNumbers(config, lotteryDbService)
            .then((result) => {
                expect(result).toBeDefined();
                done();
            })
            .catch((err) => {
                if (err) console.error(err);
                done();
            });
    }, 2000000);
});