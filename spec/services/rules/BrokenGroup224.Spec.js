let BrokenGroupService = require('../../../dist/services/rules/BrokenGroup224').BrokenGroup224;
let Config = require('../../../dist/config/Config').Config;

describe("BrokenGroup224 Test", () => {
    let brokenService;

    beforeEach((done) => {
        brokenService = new BrokenGroupService();
        done();
    });

    it("filterNumbers test", (done) => {
        Config.globalVariable.last_PrizeNumber = '78904';
        brokenService.filterNumbers()
            .then((resultArray) => {
                let result = resultArray.killNumberResult.join(',');
                expect(resultArray.killNumberResult).not.toContain('001');
                expect(resultArray.killNumberResult).toContain('003');
                done();
            });
    });
});