let NumberService = require('../../../dist/services/numbers/NumberService').NumberService;
let Config = require('../../../dist/config/Config').Config;
let Nightmare = require('nightmare');
let path = require('path');
let Promise = require('bluebird');

describe("Class NumberService Test", () => {
    let numberService, config, nightmare;

    beforeEach((done) => {
        numberService = new NumberService();
        config = new Config();
        nightmare = Nightmare({
            show: false,
            width: 800,
            heigh: 600,
            alwaysOnTop: false,
            Promise: require('bluebird'),
            webSecurity: false,
            allowRunningInsecureContent: true //允许在https的页面中调用http的资源
        });
        done();
    });

    afterAll(() => {
        nightmare
            .end()
            .then();
    });

    it("function getTotalNumberArray Test", () => {
        let totalNumberArray = numberService.getTotalNumberArray();

        expect(totalNumberArray).toBeDefined();
    });

    it("generate invest numbers count Test", (done) => {
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