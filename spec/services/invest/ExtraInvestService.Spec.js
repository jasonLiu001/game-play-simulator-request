let ExtraInvestService = require('../../../dist/services/invest/ExtraInvestService').ExtraInvestService;

describe("ExtraInvestService Test", () => {
    let extraInvestService;

    beforeEach((done) => {
        extraInvestService = new ExtraInvestService();
    });

    it("investWhenFindTwoErrorInThree test", (done) => {
        extraInvestService.investWhenFindTwoErrorInThree(1, 4)
            .then((result) => {
                console.log(result);
                done();
            });
    }, 60000);

});
