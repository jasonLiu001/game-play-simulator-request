let KillNumberGeWei = require('../../../../dist/services/rules/killnumber/KillNumberGeWei').KillNumberGeWei;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;

describe("KillNumberGeWei Test", () => {
    let killNumberGeWei;

    beforeEach((done) => {
        killNumberGeWei = new KillNumberGeWei();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it("filterNumbers test", (done) => {
        killNumberGeWei.filterNumbers()
            .then((result) => {
                expect(result).toBeDefined();
                expect(result.geWei.killNumberResult).not.toContain('015');
                done();
            })
            .catch((err) => {
                if (err) console.error(err);
                done();
            });
    }, 60000);
});