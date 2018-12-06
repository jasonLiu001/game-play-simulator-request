import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import BlueBirdPromise = require('bluebird');
import {InvestBase} from "./InvestBase";
import {NumberService} from "../numbers/NumberService";
import {ErrorService} from "../ErrorService";
import moment  = require('moment');
import {TimeService} from "../time/TimeService";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";
import {InvestTotalInfo} from "../../models/db/InvestTotalInfo";
import {ExtraInvestService} from "./ExtraInvestService";
import {PlatformService} from "../platform/PlatformService";
import {AppSettings} from "../../config/AppSettings";
import {EmailSender} from "../email/EmailSender";
import {SettingService} from "../settings/SettingService";
import {PushService} from "../push/PushService";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    numberService = new NumberService(),
    extraInvestService = new ExtraInvestService();

export class InvestService extends InvestBase {

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
                if (AppSettings.investNotification) {//发送投注邮件通知
                    let emailTitle = "【" + Config.globalVariable.current_Peroid + "】期投注提醒";
                    let emailContent = "【" + Config.globalVariable.current_Peroid + "】期已执行投注！投注时间【" + moment().format('YYYY-MM-DD HH:mm:ss') + "】，选择方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】";
                    let promiseArray: Array<BlueBirdPromise<any>> = [];
                    promiseArray.push(PushService.send(emailTitle, emailContent));
                    promiseArray.push(EmailSender.sendEmail(emailTitle, emailContent));
                    return BlueBirdPromise.all(promiseArray);
                }
                return BlueBirdPromise.resolve([]);
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
                //真实投注执行登录操作 确保买号后的金额仍然大于最小利润 这里用买号以后的账号余额和最小盈利比较目的，因为买号后当前账号余额可能为负值，说明余额不足了，所以没必要再执行真实投注了，即使开奖以后金额又够投注了，也算今天输了
                if (investInfo.currentAccountBalance > CONFIG_CONST.minAccountBalance) {
                    if (CONFIG_CONST.isRealInvest) {
                        return PlatformService.loginAndInvest(request, investInfo);
                    } else if (!CONFIG_CONST.isRealInvest && !AppSettings.isUseReverseInvestNumbers && AppSettings.isEnableInvestInMock) {
                        //在当前账号余额充足的情况下 当前是模拟投注并且是非取反投注时 才进行此操作 达到投注条件 是否可以不考虑设置中真实投注选项，自行投注
                        return extraInvestService.executeExtraInvest(request, investInfo);//该方法内部会根据条件 自动切换到真实投注
                    }

                } else {//投注后 如果买号以后的金额已经为负值了，说明从这期开始账号余额就不足了，所以直接切换到模拟投注
                    log.info("方案【%s】 买号后账户余额为: %s，小于最小值：%s，已无法进行真实购买！自动进入模拟投注模式！", CONFIG_CONST.currentSelectedInvestPlanType, investInfo.currentAccountBalance, CONFIG_CONST.minAccountBalance);
                    return SettingService.switchToMockInvest();
                }
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}
