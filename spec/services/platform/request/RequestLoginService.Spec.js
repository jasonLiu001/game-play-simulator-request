let Vbc02LoginService = require('../../../../dist/services/platform/vbc02/Vbc02LoginService').Vbc02LoginService;
let Vbc02LotteryService = require('../../../../dist/services/platform/vbc02/Vbc02LotteryService').Vbc02LotteryService;
let JiangNanLoginService = require('../../../../dist/services/platform/jiangnan/JiangNanLoginService').JiangNanLoginService;
let JiangNanLotteryService = require('../../../../dist/services/platform/jiangnan/JiangNanLotteryService').JiangNanLotteryService;
let Config = require('../../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../../dist/config/Config').CONFIG_CONST;
let HttpRequestHeaders = require('../../../../dist/models/EnumModel').HttpRequestHeaders;
let LotteryDbService = require('../../../../dist/services/dbservices/ORMService').LotteryDbService;

let Request = require('request');
let Promise = require('bluebird');

let cookie = Request.jar();
let request = Request.defaults(
    {
        jar: cookie,
        timeout: 20000,
        headers: HttpRequestHeaders,
        strictSSL: false
    });

describe('Vbc02LoginService Test', () => {
    let vbc02LoginService, vbc02LotteryService, lotteryDbService;
    let jiangNanLoginService, jiangNanLotteryService;

    beforeEach((done) => {
        //v博平台
        vbc02LoginService = new Vbc02LoginService();
        vbc02LotteryService = new Vbc02LotteryService();

        //江南平台
        jiangNanLoginService = new JiangNanLoginService();
        jiangNanLotteryService = new JiangNanLotteryService();

        lotteryDbService = new LotteryDbService();
        //投注号码
        Config.currentInvestNumbers = "123,345";
        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('JiangNanLogin Test ', function (done) {
        jiangNanLoginService.login(request)
            .then((body) => {
                console.log(body);
                //return jiangNanLotteryService.invest(request, CONFIG_CONST.touZhuBeiShu);
            })
            .then((body) => {
                console.log(body);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    done();
                }
            });
    }, 20000000);

    /**
     *
     * V博投注登录并投注 测试
     */
    xit('Vbc02LoginService Test', (done) => {
        vbc02LoginService.login(request)
            .then((body) => {
                console.log(body);
                //return vbc02LotteryService.invest(request, 1000);
            })
            .then((body) => {
                console.log(body);
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
