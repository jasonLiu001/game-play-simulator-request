import {LotteryDbService} from "./services/dbservices/DBSerivice";
import Promise = require('bluebird');
import {AwardService} from "./services/award/AwardService";
import {InvestService} from "./services/invest/InvestService";
import {ErrorService} from "./services/error/ErrorService";
import {HttpRequestHeaders} from "./models/EnumModel";
import {CONFIG_CONST} from "./config/Config";
let Request = require('request'), path = require('path');

let log4js = require('log4js');
log4js.configure(path.resolve(__dirname, 'config/log4js.json'));

let log = log4js.getLogger('App'),
    investService = new InvestService(),
    errorService = new ErrorService(),
    awardService = new AwardService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: CONFIG_CONST.autoCheckTimerInterval,
            headers: HttpRequestHeaders
        });


export class App {

    /**
     *
     *
     * 执行该方法前，需要手工设置当前账号余额
     */
    public start(): void {
        log.info('程序已启动，持续监视中...');
        LotteryDbService.createLotteryTable()
            .then(() => {
                //TODO:在投注前要手工设置当前的账号余额
                //启动更新奖号任务 奖号更新成功后执行自动投注
                awardService.start(() => {
                    investService.executeAutoInvest(request);
                });
            })
            .catch((err) => {
                errorService.appErrorHandler(log, err);
            });
    }
}

let app = new App();
app.start();