let JiOuType = require('../../../dist/services/rules/JiOuType').JiOuType;
let Config = require('../../../dist/config/Config').Config;

describe("JiOuType Test", () => {
    let jiouType;
    Config.globalVariable.last_PrizeNumber = "37274";

    beforeEach((done) => {
        jiouType = new JiOuType();
        done();
    });

    it("filterNumbers test", (done) => {
        jiouType.filterNumbers()
            .then((result) => {
                expect(result.killNumberResult).not.toContain('141');
                expect(result.killNumberResult).toContain('003');
                done();
            });
    });
});
