import {Config} from './config/Config';
import {LotteryDbService} from "./services/dbservices/DBSerivice";
import Promise = require('bluebird');
import {MockInvestService} from "./services/invest/MockInvestService";
import {AwardService} from "./services/award/AwardService";
import {ErrorService} from "./services/error/ErrorService";
import {HttpRequestHeaders} from "./models/EnumModel";
let Request = require('request');

let log4js = require('log4js');
log4js.configure('./config/log4js.json');

let log = log4js.getLogger('MockApp'),
    errorService = new ErrorService(),
    config = new Config(),
    lotteryDbService = new LotteryDbService(),//奖号服务
    awardService = new AwardService(),
    mockInvestService = new MockInvestService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: 20000,
            headers: HttpRequestHeaders
        });


export class MockApp {
    /**
     *
     *
     * 从第三方网站更新开奖数据监视器
     */
    public start(): void {
        log.info('程序已启动，持续监视中...');
        lotteryDbService.createLotteryTable()
            .then(() => {
                //TODO:在投注前要手工设置当前的账号余额
                //启动更新奖号任务 奖号更新成功后执行自动投注
                awardService.start(lotteryDbService, config, () => {
                    mockInvestService.executeAutoInvest(lotteryDbService, config);
                });
            })
            .catch((err) => {
                errorService.appErrorHandler(log, err);
            });
    }
}

let app = new MockApp();
app.start();