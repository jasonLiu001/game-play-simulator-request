let RequestLoginService = require('../../../../dist/services/platform/request/RequestLoginService').RequestLoginService;
let RequestPlatformService = require('../../../../dist/services/platform/request/RequestPlatformService').RequestPlatformService;
let Config = require('../../../../dist/config/Config').Config;
let LotteryDbService = require('../../../../dist/services/dbservices/DBSerivice').LotteryDbService;

let Request = require('request');
let Promise = require('bluebird');

let cookie = Request.jar();
let request = Request.defaults(
    {
        jar: cookie,
        timeout: 20000,
        headers: Config.httpRequestHeaders
    });

describe('RequestLoginService Test', () => {
    let requestLoginService, config, requestPlatformService, lotteryDbService;

    beforeEach((done) => {
        requestLoginService = new RequestLoginService();
        requestPlatformService = new RequestPlatformService();
        config = new Config();
        Config.currentSelectedAwardMode = Config.awardModel.yuan;
        config.captchaDecorder.user = '';
        config.captchaDecorder.pass = '';
        lotteryDbService = new LotteryDbService();
        lotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('RequestLoginService Test', (done) => {
        requestLoginService.login(request, config)
            .then((body) => {
                let res = body;
                return requestPlatformService.invest(request, config, lotteryDbService);
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