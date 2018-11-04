import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import BlueBirdPromise = require('bluebird');
import {AbstractInvestBase} from "./AbstractInvestBase";
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
import {update_isRealInvest_to_real} from "../../models/db/SettingsInfo";
import {SettingService} from "../settings/SettingService";

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
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
                if (AppSettings.investNotification) {//发送投注邮件通知
                    let emailTitle = "【" + Config.globalVariable.current_Peroid + "】期投注提醒";
                    let emailContent = "【" + Config.globalVariable.current_Peroid + "】期已执行投注！投注时间【" + moment().format('YYYY-MM-DD HH:mm:ss') + "】，选择方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】";
                    return EmailSender.sendEmail(emailTitle, emailContent);
                }
                return BlueBirdPromise.resolve(true);
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
                //真实投注执行登录操作
                if (CONFIG_CONST.isRealInvest) {
                    return PlatformService.loginAndInvest(request, investInfo);
                }

                //当前是模拟投注并且是非取反投注时 才进行此操作 达到投注条件 是否可以不考虑设置中真实投注选项，自行投注
                if (!CONFIG_CONST.isRealInvest && !AppSettings.isUseReverseInvestNumbers && AppSettings.isEnableInvestInMock) {
                    //该方法内部会根据条件 自动切换到真实投注
                    return extraInvestService.executeExtraInvest(request, investInfo);
                }
            })
            .catch((e) => {
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}
