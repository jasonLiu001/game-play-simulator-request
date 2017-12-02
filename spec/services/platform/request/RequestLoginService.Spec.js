let Vbc02LoginService = require('../../../../dist/services/platform/vbc02/Vbc02LoginService').Vbc02LoginService;
let Vbc02LotteryService = require('../../../../dist/services/platform/vbc02/Vbc02LotteryService').Vbc02LotteryService;
let Config = require('../../../../dist/config/Config').Config;
let HttpRequestHeaders = require('../../../../dist/models/EnumModel').HttpRequestHeaders;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;

let Request = require('request');
let Promise = require('bluebird');

let cookie = Request.jar();
let request = Request.defaults(
    {
        jar: cookie,
        timeout: 20000,
        headers: HttpRequestHeaders
    });

describe('Vbc02LoginService Test', () => {
    let vbc02LoginService, vbc02LotteryService, lotteryDbService;

    beforeEach((done) => {
        vbc02LoginService = new Vbc02LoginService();
        vbc02LotteryService = new Vbc02LotteryService();
        lotteryDbService = new LotteryDbService();
        //投注号码
        Config.currentInvestNumbers = "123,345";
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('Vbc02LoginService Test', (done) => {
        vbc02LoginService.login(request)
            .then((body) => {
                let res = body;
                return res;
                //return vbc02LotteryService.invest(request, 1000);
            })
            .then((body) => {
                let res = body;
                console.log(res);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    done();
                }
            });
    }, 20000000);
});