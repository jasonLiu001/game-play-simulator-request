let JiangNanLoginService = require('../../../../dist/services/platform/jiangnan/JiangNanLoginService').JiangNanLoginService;
let JiangNanLotteryService = require('../../../../dist/services/platform/jiangnan/JiangNanLotteryService').JiangNanLotteryService;
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

describe('JiangNanLoginService Test', () => {
    let requestLoginService, requestPlatformService, lotteryDbService;

    beforeEach((done) => {
        requestLoginService = new JiangNanLoginService();
        requestPlatformService = new JiangNanLotteryService();
        lotteryDbService = new LotteryDbService();
        //投注号码
        Config.currentInvestNumbers = "123,345";
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('JiangNanLoginService Test', (done) => {
        requestLoginService.login(request)
            .then((body) => {
                let res = body;
                return requestPlatformService.invest(request,1000);
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