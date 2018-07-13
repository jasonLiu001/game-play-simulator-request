import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import BlueBirdPromise = require('bluebird');
import {AbstractInvestBase} from "./AbstractInvestBase";
import {JiangNanLoginService} from "../platform/jiangnan/JiangNanLoginService";
import {JiangNanLotteryService} from "../platform/jiangnan/JiangNanLotteryService";
import {NumberService} from "../numbers/NumberService";
import {ErrorService} from "../ErrorService";
import moment  = require('moment');
import {TimeService} from "../time/TimeService";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";
import {InvestTotalInfo} from "../../models/db/InvestTotalInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    jiangNanLoginService = new JiangNanLoginService(),
    jiangNanLotteryService = new JiangNanLotteryService,
    numberService = new NumberService();

export class InvestService extends AbstractInvestBase {

    /**
     * 入口方法
     * @param request request对象实例
     */
    async executeAutoInvest(request: any): BlueBirdPromise<any> {
        return this.calculateWinMoney()
            .then(() => {
                log.info('正在产生投注号码...');
                //产生当期的投注号码
                return numberService.generateInvestNumber();
            })
            .then(() => {
                return this.initAllPlanInvestInfo(CONST_INVEST_TOTAL_TABLE.tableName)
                    .then((allInvestTotalInfo: Array<InvestTotalInfo>) => {
                        log.info('%s表记录已保存数据%s条', CONST_INVEST_TOTAL_TABLE.tableName, allInvestTotalInfo.length);
                        return LotteryDbService.saveOrUpdateInvestTotalInfoList(allInvestTotalInfo);
                    });
            })
            .then(() => {
                //投注前保存 投注号码
                log.info('是否可真实投注..条件检查结果如下：');
                //检查是否满足投注条件
                return this.doCheck();
            })
            .then(() => {
                let messageType = CONFIG_CONST.isRealInvest ? "真实投注" : "模拟投注";
                log.info('正在保存%s记录...', messageType);
                //真实后模拟投注后 更新各个方案的账户余额
                return this.initAllPlanInvestInfo(CONST_INVEST_TABLE.tableName)
                    .then((allPlanInvestInfo: Array<InvestInfo>) => {
                        log.info('%s表%s记录已保存', CONST_INVEST_TABLE.tableName, messageType);
                        //保存投注记录
                        return LotteryDbService.saveOrUpdateInvestInfoList(allPlanInvestInfo);
                    });
            })
            .then(() => {
                //当前期号
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                return LotteryDbService.getInvestInfo(currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
            })
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.resolve();

                //真实投注执行登录操作 未达到最大利润值和亏损值
                if (investInfo.currentAccountBalance < CONFIG_CONST.maxAccountBalance && investInfo.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    if (CONFIG_CONST.isRealInvest) {
                        log.info('正在执行真实登录...');
                        //使用request投注 需要先登录在投注 每次投注前都需要登录
                        return jiangNanLoginService.login(request)
                            .then((loginResult) => {
                                log.info('真实登录操作%s', loginResult ? '已执行完成' : '失败');
                                if (loginResult) log.info(loginResult);
                            });
                    }
                }
            })
            .then(() => {
                //当前期号
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                return LotteryDbService.getInvestInfo(currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
            })
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.resolve();

                log.info(CONFIG_CONST.isRealInvest ? '真实投注执行中...' : '模拟投注执行中...');
                log.info('投注前账户余额：%s', investInfo.currentAccountBalance);
                if (investInfo.currentAccountBalance < CONFIG_CONST.maxAccountBalance && investInfo.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    //真实投注 未达到最大利润值和亏损值
                    if (CONFIG_CONST.isRealInvest) {
                        log.info('正在执行真实投注...');
                        return jiangNanLotteryService.invest(request, CONFIG_CONST.touZhuBeiShu)
                            .then((investResult) => {
                                log.info('真实投注操作%s', investResult ? '已执行完成' : '失败');
                                //真实投注成功后，记录已经成功投注的期数
                                Config.currentInvestTotalCount++;
                                log.info('第%s次任务，执行完成，当前时间:%s', Config.currentInvestTotalCount, moment().format('YYYY-MM-DD HH:mm:ss'));
                                if (investResult) log.info(investResult);
                            })
                            .then(() => {
                                log.info('正在执行退出登录...');
                                //投注完成后 退出登录
                                return jiangNanLoginService.loginOut(request, "/login/loginOut.mvc");
                            })
                            .then(() => {
                                log.info("退出登录操作已执行完成");
                            });
                    }
                }
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}
