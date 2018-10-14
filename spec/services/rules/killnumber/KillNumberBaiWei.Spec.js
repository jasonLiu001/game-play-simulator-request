let KillNumberBaiWei = require('../../../../dist/services/rules/killnumber/KillNumberBaiWei').KillNumberBaiWei;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;

describe("KillNumberGeWei Test", () => {
    let killNumberBaiWei;

    beforeEach((done) => {
        killNumberBaiWei = new KillNumberBaiWei();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it("filterNumbers test", (done) => {
        killNumberBaiWei.filterNumbers()
            .then((result) => {
                expect(result).toBeDefined();
                expect(result.baiWei.killNumberResult).not.toContain('015');
                done();
            })
            .catch((err) => {
                if (err) console.error(err);
                done();
            });
    }, 60000);
});