let NumbersDistance = require('../../../dist/services/rules/NumbersDistance').NumbersDistance;
let Config = require('../../../dist/config/Config').Config;

describe("SumValues Test", () => {
    let numbersDistance;
    Config.globalVariable.last_PrizeNumber = "36894";
    beforeEach((done) => {
        numbersDistance = new NumbersDistance();
        done();
    });

    it("filterNumbers test", (done) => {
        numbersDistance.filterNumbers()
            .then((result) => {
                expect(result.killNumberResult).not.toContain('015');
                expect(result.killNumberResult).toContain('042');
                done();
            });
    });
});
