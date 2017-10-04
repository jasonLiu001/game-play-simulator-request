import {LotteryDbService} from "../dbservices/DBSerivice";
import {Config} from "../../config/Config";
import {InvestInfo} from "../../models/InvestInfo";
import Promise = require('bluebird');
import {NightmarePlatformService} from "../platform/nightmare/NightmarePlatformService";
import {AbstractInvestBase} from "./AbstractInvestBase";
import {RequestLoginService} from "../platform/request/RequestLoginService";
import {RequestPlatformService} from "../platform/request/RequestPlatformService";
import {NumberService} from "../numbers/NumberService";


let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    requestLoginService = new RequestLoginService(),
    requestPlatformService = new RequestPlatformService,
    numberService = new NumberService(),
    nightmarePlatformService = new NightmarePlatformService();

export class InvestService extends AbstractInvestBase {
    /**
     *
     * 模拟执行投注入口方法
     */
    executeAutoInvest(nightmare: any, request: any, lotteryDbService: LotteryDbService, config: Config): void {
        this.calculateWinMoney(lotteryDbService, config)
            .then(() => {
                //检查是否满足投注条件
                return this.doCheck(config, false);
            })
            .then(() => {
                log.info('投注前账户余额：%s', config.globalVariable.currentAccoutBalance);
                log.info('正在执行投注...');
                return numberService.generateInvestNumber(config, lotteryDbService)
                    .then((investNumbers: string) => {
                        //投注前保存 投注号码
                        Config.currentInvestNumbers = investNumbers;
                        if (nightmare) {
                            //使用nightmare 正式投注
                            return nightmarePlatformService.autoInvest(nightmare, config, lotteryDbService, config.autoInvestModel);
                        } else if (request) {
                            //使用request投注 需要先登录在投注 每次投注前都需要登录
                            return requestLoginService.login(request, config)
                                .then(() => {
                                    return requestPlatformService.invest(request, config, lotteryDbService);
                                })
                                .then((result) => {
                                    log.info(result);
                                });
                        }
                    });
            })
            .then(() => {
                log.info('投注成功，保存投注记录中...');
                //成功投注后 保存投注信息
                this.updateCurrentAccountBalance(config, lotteryDbService);
                //输出当前账户余额
                log.info('买号后余额：%s', config.globalVariable.currentAccoutBalance);
                //真实投注成功后，记录已经成功投注的期数
                Config.currentInvestTotalCount++;
                let investInfo: InvestInfo = this.initInvestInfo(config);
                log.info('投注记录已保存');
                log.info('第%s次任务，执行完成，当前时间:%s', Config.currentInvestTotalCount, new Date().toLocaleTimeString());
                //保存投注记录
                return lotteryDbService.saveOrUpdateInvestInfo(investInfo);
            })
            .catch((e) => {
                if (e) {
                    log.error('投注已自动结束，原因如下：');
                    log.error(e);
                }
            });
    }
}