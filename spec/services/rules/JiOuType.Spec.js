let JiOuType = require('../../../dist/services/rules/JiOuType').JiOuType;
let Config = require('../../../dist/config/Config').Config;

describe("JiOuType Test", () => {
    let jiouType, config;

    beforeEach((done) => {
        jiouType = new JiOuType();
        config = new Config();
        config.globalVariable.last_PrizeNumber = "37274";
        done();
    });

    it("filterNumbers test", (done) => {
        jiouType.filterNumbers(config, null)
            .then((result) => {
                expect(result).not.toContain('141');
                expect(result).toContain('418');
                done();
            });
    });
});
