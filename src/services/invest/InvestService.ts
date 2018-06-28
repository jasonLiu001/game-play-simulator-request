import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import Promise = require('bluebird');
import {AbstractInvestBase} from "./AbstractInvestBase";
import {JiangNanLoginService} from "../platform/jiangnan/JiangNanLoginService";
import {JiangNanLotteryService} from "../platform/jiangnan/JiangNanLotteryService";
import {NumberService} from "../numbers/NumberService";
import {ErrorService} from "../ErrorService";
import moment  = require('moment');
import {SettingsInfo} from "../../models/db/SettingsInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    jiangNanLoginService = new JiangNanLoginService(),
    jiangNanLotteryService = new JiangNanLotteryService,
    numberService = new NumberService();

export class InvestService extends AbstractInvestBase {

    /**
     * 模拟执行投注入口方法
     * @param request request对象实例
     * @param isRealInvest 是否是真实投注 true:真实投注  false:模拟投注
     */
    executeAutoInvest(request: any, isRealInvest: boolean): void {
        this.calculateWinMoney()
            .then(() => {
                log.info('正在产生投注号码...');
                //产生当期的投注号码
                return numberService.generateInvestNumber();
            })
            .then((investNumbers: string) => {
                log.info('投注号码已生成！');
                //投注前保存 投注号码
                Config.currentInvestNumbers = investNumbers;
                log.info('是否可投注..条件检查结果如下：');
                //检查是否满足投注条件
                return this.doCheck(isRealInvest);
            })
            .then(() => {
                //真实投注执行登录操作 未达到最大利润值和亏损值
                if (Config.currentAccountBalance < CONFIG_CONST.maxAccountBalance && Config.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    if (isRealInvest) {
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
                log.info(isRealInvest ? '真实投注执行中...' : '模拟投注执行中...');
                log.info('投注前账户余额：%s', Config.currentAccountBalance);
                if (Config.currentAccountBalance < CONFIG_CONST.maxAccountBalance && Config.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    //真实投注 未达到最大利润值和亏损值
                    if (isRealInvest) {
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
            .then(() => {
                let messageType = isRealInvest ? "真实投注" : "模拟投注";
                log.info('正在保存%s记录...', messageType);
                //真实后模拟投注后 更新各个方案的账户余额
                this.updateAllPlanAccountBalance();
                //输出当前账户余额
                log.info('%s买号后余额：%s', messageType, Config.currentAccountBalance);
                let allPlanInvestInfo: Array<InvestInfo> = this.initAllPlanInvestInfo();
                log.info('%记录已保存', messageType);
                //保存投注记录
                return LotteryDbService.saveOrUpdateInvestInfoList(allPlanInvestInfo);
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}