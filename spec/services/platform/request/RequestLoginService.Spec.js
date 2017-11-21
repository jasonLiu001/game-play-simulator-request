let JiangNanLoginService = require('../../../../dist/services/platform/request/JiangNanLoginService').JiangNanLoginService;
let JiangNanLotteryService = require('../../../../dist/services/platform/request/JiangNanLotteryService').JiangNanLotteryService;
let Config = require('../../../../dist/config/Config').Config;
let EnumAwardMode = require('../../../../dist/models/EnumModel').EnumAwardMode;
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
    let requestLoginService, config, requestPlatformService, lotteryDbService;

    beforeEach((done) => {
        requestLoginService = new JiangNanLoginService();
        requestPlatformService = new JiangNanLotteryService();
        config = new Config();
        Config.currentSelectedAwardMode = EnumAwardMode.yuan;
        lotteryDbService = new LotteryDbService();
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('JiangNanLoginService Test', (done) => {
        requestLoginService.login(request)
            .then((body) => {
                let res = body;
                return requestPlatformService.invest(request, lotteryDbService);
            })
            .then((body) => {
                let res = body;
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