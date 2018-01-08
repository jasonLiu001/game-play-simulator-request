let NumberService = require('../../../dist/services/numbers/NumberService').NumberService;
let Config = require('../../../dist/config/Config').Config;
let path = require('path');
let Promise = require('bluebird');

describe("Class NumberService Test", () => {
    let numberService;

    beforeEach((done) => {
        numberService = new NumberService();
        done();
    });

    it("function getTotalNumberArray Test", () => {
        let totalNumberArray = numberService.getTotalNumberArray();

        expect(totalNumberArray).toBeDefined();
    });

    it("function isLastPrizeNumberValid Test", () => {
        Config.globalVariable.current_Peroid = "20180210-005";
        let isLastPrizeNumberValid = numberService.isLastPrizeNumberValid();
        expect(isLastPrizeNumberValid).toBe(true);
    });

    xit("generate invest numbers count Test", (done) => {
        Config.globalVariable.last_PrizeNumber = "96789";
        numberService
            .generateInvestNumber()
            .then((result) => {
                let res = result.split(',');
                expect(res.length).toBeGreaterThan(500);
                done();
            });
    }, 200000);
});