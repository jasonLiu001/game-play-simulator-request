let Vbc02LoginService = require('../../../../dist/services/platform/vbc02/Vbc02LoginService').Vbc02LoginService;
let Vbc02LotteryService = require('../../../../dist/services/platform/vbc02/Vbc02LotteryService').Vbc02LotteryService;
let JiangNanLoginService = require('../../../../dist/services/platform/jiangnan/JiangNanLoginService').JiangNanLoginService;
let JiangNanLotteryService = require('../../../../dist/services/platform/jiangnan/JiangNanLotteryService').JiangNanLotteryService;
let Config = require('../../../../dist/config/Config').Config;
let CONFIG_CONST = require('../../../../dist/config/Config').CONFIG_CONST;
let HttpRequestHeaders = require('../../../../dist/models/EnumModel').HttpRequestHeaders;
let LotteryDbService = require('../../../../dist/services/dbservices/ORMService').LotteryDbService;
let InvestInfo = require('../../../../dist/models/db/InvestInfo').InvestInfo;
let TimeService = require('../../../../dist/services/time/TimeService').TimeService;

let Request = require('request');
let Promise = require('bluebird');
let moment = require('moment');

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
    let investInfo;

    beforeEach((done) => {
        //v博平台
        vbc02LoginService = new Vbc02LoginService();
        vbc02LotteryService = new Vbc02LotteryService();

        //江南平台
        jiangNanLoginService = new JiangNanLoginService();
        jiangNanLotteryService = new JiangNanLotteryService();

        lotteryDbService = new LotteryDbService();

        //投注实体
        investInfo = new InvestInfo();
        //当前期号
        investInfo.period = TimeService.getCurrentPeriodNumber(new Date());
        investInfo.planType = "1";
        investInfo.investNumbers = "234";
        investInfo.currentAccountBalance = 1000;
        investInfo.investNumberCount = 1;
        investInfo.awardMode = 1000;//厘模式
        investInfo.touZhuBeiShu = 1;//1倍
        investInfo.isUseReverseInvestNumbers = 0;
        investInfo.winMoney = 0;
        investInfo.status = 0;
        investInfo.isWin = 0;
        investInfo.investTime = moment().format('YYYY-MM-DD HH:mm:ss');
        investInfo.investDate = moment().format('YYYY-MM-DD');
        investInfo.investTimestamp = moment().format('HH:mm:ss');

        LotteryDbService.createLotteryTable()
            .then(() => {
                done();
            });
    });

    it('JiangNanLogin Test ', function (done) {
        jiangNanLoginService.login(request)
            .then((body) => {
                console.log(body);
                //return jiangNanLotteryService.invest(request, investInfo);
            })
            .then((body) => {
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    done();
                }
            });
    }, 60000);

    /**
     *
     * V博投注登录并投注 测试
     */
    xit('Vbc02LoginService Test', (done) => {
        vbc02LoginService.login(request)
            .then((body) => {
                console.log(body);
                //return vbc02LotteryService.invest(request, investInfo);
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
    }, 60000);
});
