import {LotteryDbService} from "../dbservices/DBSerivice";
import {Config} from "../../config/Config";
import {InvestInfo} from "../../models/InvestInfo";
import Promise = require('bluebird');
import {AbstractInvestBase} from "./AbstractInvestBase";
import {NumberService} from "../numbers/NumberService";


let log4js = require('log4js'),
    log = log4js.getLogger('MockInvestService'),
    numberService = new NumberService();


export class MockInvestService extends AbstractInvestBase {
    /**
     *
     * 模拟执行投注入口方法
     */
    executeAutoInvest(lotteryDbService: LotteryDbService): void {
        this.calculateWinMoney()
            .then(() => {
                //检查是可以投注
                return this.doCheck(true);
            })
            .then(() => {
                log.info('投注前账户余额：%s', Config.globalVariable.currentAccoutBalance);
                log.info('正在执行投注...');
                return numberService.generateInvestNumber(lotteryDbService)
                    .then((currentInvestNumbers) => {
                        //投注前保存 投注号码
                        Config.currentInvestNumbers = currentInvestNumbers;
                        //真实的投注开始执行
                    });
            })
            .then(() => {
                log.info('投注成功，保存投注记录中...');
                //成功投注后 保存投注信息
                this.updateCurrentAccountBalance();
                //输出当前账户余额
                log.info('买号后余额：%s', Config.globalVariable.currentAccoutBalance);
                //真实投注成功后，记录已经成功投注的期数
                Config.currentInvestTotalCount++;
                let investInfo: InvestInfo = this.initInvestInfo();
                log.info('投注记录已保存');
                log.info('第%s次任务，执行完成，当前时间:%s', Config.currentInvestTotalCount, new Date().toLocaleTimeString());
                //保存投注记录
                return LotteryDbService.saveOrUpdateInvestInfo(investInfo);
            })
            .catch((e) => {
                if (e) {
                    log.error('投注已自动结束，原因如下：');
                    log.error(e);
                }
            });
    }
}