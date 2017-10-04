import {Config} from './config/Config';
import {LotteryDbService} from "./services/dbservices/DBSerivice";
import Promise = require('bluebird');
import {AwardService} from "./services/award/AwardService";
import {InvestService} from "./services/invest/InvestService";
import {ErrorService} from "./services/error/ErrorService";
let Request = require('request'), path = require('path');

let log4js = require('log4js');
log4js.configure(path.resolve(__dirname, 'config/log4js.json'));

let log = log4js.getLogger('App'),
    investService = new InvestService(),
    errorService = new ErrorService(),
    config = new Config(),
    lotteryDbService = new LotteryDbService(),//奖号服务
    awardService = new AwardService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: 20000,
            headers: Config.httpRequestHeaders
        });


export class App {

    /**
     *
     *
     * 执行该方法前，需要手工设置当前账号余额
     */
    public start(): void {
        log.info('程序已启动，持续监视中...');
        lotteryDbService.createLotteryTable()
            .then(() => {
                //TODO:在投注前要手工设置当前的账号余额
                //启动更新奖号任务 奖号更新成功后执行自动投注
                awardService.start(null, lotteryDbService, config, () => {
                    investService.executeAutoInvest(request, lotteryDbService, config);
                });
            })
            .catch((err) => {
                //启动失败后结束electron进程
                errorService.appErrorHandler(log, err, config);
            });
    }
}

let app = new App();
app.start();