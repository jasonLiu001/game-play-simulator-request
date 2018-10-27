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
import {ExtraInvestService} from "./ExtraInvestService";
import {EmailSender} from "../email/EmailSender";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    jiangNanLoginService = new JiangNanLoginService(),
    jiangNanLotteryService = new JiangNanLotteryService,
    numberService = new NumberService(),
    extraInvestService = new ExtraInvestService();

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
                log.info('正在保存表%s 投注记录...', CONST_INVEST_TOTAL_TABLE.tableName);
                return this.initAllPlanInvestInfo(CONST_INVEST_TOTAL_TABLE.tableName)
                    .then((allInvestTotalInfo: Array<InvestTotalInfo>) => {
                        log.info('%s表记录已保存数据%s条', CONST_INVEST_TOTAL_TABLE.tableName, allInvestTotalInfo.length);
                        return LotteryDbService.saveOrUpdateInvestTotalInfoList(allInvestTotalInfo);
                    })
                    .then(() => {
                        //表invest_total第一次初始化完毕 重置标识
                        if (Config.isInvestTotalTableInitCompleted) Config.isInvestTotalTableInitCompleted = false;
                    });
            })
            .then(() => {
                //投注前保存 投注号码
                log.info('当前选择的方案%s 是否可真实投注..条件检查结果如下：', CONFIG_CONST.currentSelectedInvestPlanType);
                //检查是否满足投注条件
                return this.doCheck();
            })
            .then(() => {
                let messageType = CONFIG_CONST.isRealInvest ? "真实投注" : "模拟投注";
                log.info('正在保存表%s %s记录...', CONST_INVEST_TABLE.tableName, messageType);
                //真实后模拟投注后 更新各个方案的账户余额
                return this.initAllPlanInvestInfo(CONST_INVEST_TABLE.tableName)
                    .then((allPlanInvestInfo: Array<InvestInfo>) => {
                        log.info('%s表 %s记录已保存', CONST_INVEST_TABLE.tableName, messageType);
                        //保存投注记录
                        return LotteryDbService.saveOrUpdateInvestInfoList(allPlanInvestInfo);
                    })
                    .then(() => {
                        //表invest第一次初始化完毕 重置标识
                        if (Config.isInvestTableInitCompleted) Config.isInvestTableInitCompleted = false;
                    });
            })
            .then(() => {
                //当前期号
                let currentPeriod = TimeService.getCurrentPeriodNumber(new Date());
                return LotteryDbService.getInvestInfo(currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
            })
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.resolve();

                //doCheck全部验证通过 则表明可投注，不管是模拟投注还是真实投注，当前的真实投注值都应该增加，此值可用于判断已经投注的次数，模拟或者真实
                Config.currentInvestTotalCount++;
                //真实投注执行登录操作 未达到最大利润值和亏损值
                if (investInfo.currentAccountBalance < CONFIG_CONST.maxAccountBalance && investInfo.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    if (CONFIG_CONST.isRealInvest) {
                        return this.loginAndInvest(request, investInfo);
                    }
                }

                return investInfo;
            })
            .then((investInfo: InvestInfo) => {
                if (!investInfo) return BlueBirdPromise.resolve();

                //当前是模拟投注 才进行此操作 达到投注条件 是否可以不考虑设置中真实投注选项，自行投注
                if (!CONFIG_CONST.isRealInvest) {
                    return extraInvestService.investWhenFindTwoErrorInThree(CONFIG_CONST.currentSelectedInvestPlanType, 3, CONST_INVEST_TABLE.tableName)
                        .then((isCanInvest) => {
                            if (isCanInvest) {
                                return this.loginAndInvest(request, investInfo)
                                    .then(() => {
                                        return EmailSender.sendEmail('符合对错错条件', '已自动投注')
                                    });
                            }
                        });
                }
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }

    /**
     *
     * 登录平台并执行真实投注
     * @param request
     * @param investInfo
     */
    public async loginAndInvest(request: any, investInfo: InvestInfo): BlueBirdPromise<any> {
        log.info('正在执行真实登录...');
        //使用request投注 需要先登录在投注 每次投注前都需要登录
        return jiangNanLoginService.login(request)
            .then((loginResult) => {
                log.info('真实登录操作%s', loginResult ? '已执行完成' : '失败');
                if (loginResult) log.info(loginResult);

                log.info('正在执行真实投注...');
                log.info(CONFIG_CONST.isRealInvest ? '真实投注执行中...' : '模拟投注执行中...');
                log.info('方案%s 投注前账户余额：%s', CONFIG_CONST.currentSelectedInvestPlanType, investInfo.currentAccountBalance);
                return jiangNanLotteryService.invest(request, investInfo);
            })
            .then((investResult) => {
                log.info('真实投注操作%s', investResult ? '已执行完成' : '失败');
                log.info('第%s次任务，执行完成，当前时间:%s', Config.currentInvestTotalCount, moment().format('YYYY-MM-DD HH:mm:ss'));
                if (investResult) log.info(investResult);
                log.info('正在执行退出登录...');
                //投注完成后 退出登录
                return jiangNanLoginService.loginOut(request, "/login/loginOut.mvc")
                    .then(() => {
                        log.info("退出登录操作已执行完成");
                        return investResult;
                    });
            });
    }
}
