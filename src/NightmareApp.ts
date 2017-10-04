import {Config, CONFIG_CONST} from './config/Config';
import {LotteryDbService} from "./services/dbservices/DBSerivice";
import {NightmareLoginService} from "./services/platform/nightmare/NightmareLoginService";
import Promise = require('bluebird');
import Nightmare = require('nightmare');
import {ErrorService} from "./services/error/ErrorService";
import {AwardService} from "./services/award/AwardService";
import {NightmarePlatformService} from "./services/platform/nightmare/NightmarePlatformService";
import {InvestService} from "./services/invest/InvestService";
let nightmarePlugin = require('./plugins/Index');
let log4js = require('log4js');
log4js.configure('./config/log4js.json');

//导入所有插件
nightmarePlugin.install(Nightmare);

let log = log4js.getLogger('NightmareApp'),
    config = new Config(),
    lotteryDbService = new LotteryDbService(),//奖号服务
    loginService = new NightmareLoginService(),
    investService = new InvestService(),
    errorService = new ErrorService(),
    awardService = new AwardService(),
    platformService = new NightmarePlatformService(),
    nightmare = Nightmare({
        show: CONFIG_CONST.isShowBrowser,
        width: 800,
        heigh: 600,
        alwaysOnTop: false,
        typeInterval: -1,//设置type的速度
        Promise: require('bluebird'),
        webSecurity: false,
        allowRunningInsecureContent: true //允许在https的页面中调用http的资源
    });

export class NightmareApp {

    /**
     *
     *
     * 启动nightmare应用
     */
    public start(): void {
        log.info('程序已启动，持续监视中...');
        lotteryDbService.createLotteryTable()
            .then(() => {
                //破解验证码
                return loginService.getCaptchaCodeString(nightmare, config);
            })
            .then((captchaCodeString) => {
                //登录
                return loginService.login(nightmare, config, captchaCodeString);
            })
            .then(() => {
                //获取当前账号余额 并更新全局变量中的账号余额
                return platformService.getAccountBalance(nightmare, config);
            })
            .then(() => {
                //启动更新奖号任务 奖号更新成功后执行自动投注
                awardService.start(nightmare, lotteryDbService, config, () => {
                    investService.executeAutoInvest(nightmare, null, lotteryDbService, config);
                });
            })
            .catch((err) => {
                //启动失败后结束electron进程
                errorService.appErrorHandler(nightmare, log, err, config);
            });
    }
}

let app = new NightmareApp();
app.start();