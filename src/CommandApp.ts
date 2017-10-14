import {Config} from './config/Config';
import {LotteryDbService} from "./services/dbservices/DBSerivice";
import Promise = require('bluebird');
import {ErrorService} from "./services/ErrorService";
import {RequestLoginService} from "./services/platform/RequestLoginService";
import {RequestPlatformService} from "./services/platform/RequestPlatformService";
import {TimeService} from "./services/time/TimeService";
import {HttpRequestHeaders} from "./models/EnumModel";
let Request = require('request'), path = require('path');

let log4js = require('log4js'),
    requestPlatformService = new RequestPlatformService,
    requestLoginService = new RequestLoginService();

log4js.configure(path.resolve(__dirname, 'config/log4js.json'));

let log = log4js.getLogger('CommandApp'),
    program = require('commander'),
    timerService = new TimeService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: 20000,
            headers: HttpRequestHeaders
        });

program
    .version('0.0.1')
    .option('-n, --numbers [numbers]', '投注的号码', '')
    .option('-a, --awardmode [awardmode]', '元角分模式：  元：1,  角：10，  分：100，  厘：1000', parseFloat, 100)
    .option('-m, --maxaccountreached [maxaccountreached]', '当前账户最大值 单位：元  值0:表示不限制', parseFloat, 0)
    .option('-l, --maxloseaccountreached [maxloseaccountreached]', '当前账户最小值 单元：元  值0:表示不限制', parseFloat, 0)
    .option('-d, --begindoublecount [begindoublecount]', '起始投注倍数 默认从1倍开始', parseFloat, 1)
    .option('-p, --currentperiodstring [currentperiodstring]', '当前投注期号', '')
    .parse(process.argv);


export class CommandApp {

    /**
     *
     *
     * 执行该方法前，需要手工设置当前账号余额
     */
    public start(): void {
        if (program.numbers == "") {
            log.info("必须输入投注号码");
            return;
        }

        LotteryDbService.createLotteryTable()
            .then(() => {
                //使用request投注 需要先登录在投注 每次投注前都需要登录
                return requestLoginService.login(request);
            })
            .then(() => {
                //获取当前账号余额
                return requestPlatformService.getBalance(request);
            })
            .then((body) => {
                try {
                    let data = JSON.parse(body);
                    log.info("当前账号余额：%s", data.data.lottery);
                    if (program.maxaccountreached != 0 && data.data.lottery >= program.maxaccountreached) {
                        log.info("当前账号余额：%s，已超过设置最大盈利值:%s，投注已自动终止", data.data.lottery, program.maxaccountreached);
                        return Promise.resolve(true);
                    }
                    if (program.maxloseaccountreached != 0 && data.data.lottery <= program.maxloseaccountreached) {
                        log.info("当前账号余额：%s，已超过设置最大亏损值:%s，投注已自动终止", data.data.lottery, program.maxloseaccountreached);
                        return Promise.resolve(true);
                    }
                } catch (e) {

                }

                let currentPeriod = timerService.getCurrentPeriodNumber(new Date());
                if (program.currentperiodstring != currentPeriod) {
                    log.info("期号不一致 参数传递期号:%s，当前期号：%s", program.currentperiodstring, currentPeriod);
                    return Promise.resolve(true);
                }

                //当前投注号码
                Config.currentInvestNumbers = program.numbers;
                log.info("当前投注号码：%s", program.numbers);
                //当前选择的元角分模式
                Config.currentSelectedAwardMode = program.awardmode;
                //当前投注倍数
                //投注
                return requestPlatformService.multiInvest(request, program.begindoublecount);
            })
            .catch((err) => {
                //启动失败后结束electron进程
                ErrorService.appErrorHandler(log, err);
            });
    }
}

let app = new CommandApp();
app.start();
setTimeout(function () {
}, 10000);