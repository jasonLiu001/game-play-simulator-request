let SumValues = require('../../../dist/services/rules/SumValues').SumValues;
let Config = require('../../../dist/config/Config').Config;

describe("SumValues Test", () => {
    let sumValues;
    Config.globalVariable.last_PrizeNumber = "37274";
    beforeEach((done) => {
        sumValues = new SumValues();
        done();
    });

    it("filterNumbers test", (done) => {
        sumValues.filterNumbers()
            .then((result) => {
                expect(result.killNumberResult).not.toContain('247');
                expect(result.killNumberResult).toContain('003');
                done();
            });
    });
});