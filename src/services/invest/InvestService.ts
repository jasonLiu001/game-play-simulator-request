import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import {InvestBase} from "./InvestBase";
import {NumberService} from "../numbers/NumberService";
import {ErrorService} from "../ErrorService";
import {Tencent75TimeService} from "../time/Tencent75TimeService";
import {InvestTotalInfo} from "../../models/db/InvestTotalInfo";
import {ExtraInvestService} from "./ExtraInvestService";
import {PlatformService} from "../platform/PlatformService";
import {AppSettings} from "../../config/AppSettings";
import {SettingService} from "../settings/SettingService";
import {EnumDbTableName} from "../../models/EnumModel";
import {NotificationService} from "../notification/NotificationService";
import {DoubleInvestService} from "./DoubleInvestService";
import {AwardService} from "../award/AwardService";
import {ConstVars} from "../../global/ConstVars";
import {InvestTableService} from "../dbservices/services/InvestTableService";
import moment  = require('moment');
import BlueBirdPromise = require('bluebird');

let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    numberService = new NumberService(),
    extraInvestService = new ExtraInvestService(),
    notificationService = new NotificationService(),
    doubleInvestService = new DoubleInvestService();

export class InvestService extends InvestBase {

    /**
     * 入口方法
     * @param request request对象实例
     */
    async executeAutoInvest(request: any): BlueBirdPromise<any> {
        //本期执行投注时，发现上期仍然没有开奖，则改用其他开奖源更新开奖数据
        return InvestTableService.getInvestInfoHistoryByTableName(EnumDbTableName.INVEST_TOTAL, CONFIG_CONST.currentSelectedInvestPlanType, 1)
            .then((historyData: Array<InvestInfo>) => {
                if (historyData.length > 0 && historyData[0].status === 0) {//上期未开奖 则从其他开奖源更新上期奖号
                    return AwardService.saveOrUpdateHistoryAwardByDate(moment().format(ConstVars.momentDateFormatter))
                        .then(() => {
                            return this.calculateWinMoney();
                        });
                } else {
                    return this.calculateWinMoney();
                }
            })
            .then(() => {
                log.info('正在产生投注号码...');
                //产生当期的投注号码
                return numberService.generateInvestNumber();
            })
            .then(() => {
                log.info('正在保存表%s 投注记录...', EnumDbTableName.INVEST_TOTAL);
                return this.initAllPlanInvestInfo(EnumDbTableName.INVEST_TOTAL)
                    .then((allInvestTotalInfo: Array<InvestTotalInfo>) => {
                        log.info('%s表记录已保存数据%s条', EnumDbTableName.INVEST_TOTAL, allInvestTotalInfo.length);
                        return InvestTableService.saveOrUpdateInvestInfoListByTableName(EnumDbTableName.INVEST_TOTAL, allInvestTotalInfo);
                    })
                    .then(() => {
                        //表invest_total第一次初始化完毕 重置标识
                        if (Config.isInvestTotalTableInitCompleted) Config.isInvestTotalTableInitCompleted = false;

                        //发送invest_total表 投注提醒通知
                        if (AppSettings.totalTableBuyNotification) return notificationService.sendBuyNumberNotification();
                    });
            })
            .then(() => {
                if (AppSettings.runtime_IsInDoubleInvestMode) {//倍投模式
                    log.info("检查已启用倍投模式，倍投模式执行中...");
                    return doubleInvestService.executeDoubleInvestService(request);
                }
            })
            .then(() => {
                //投注前保存 投注号码
                log.info('当前选择的方案%s 是否可真实投注..条件检查结果如下：', CONFIG_CONST.currentSelectedInvestPlanType);
                //检查是否满足投注条件
                return this.doCheck();
            })
            .then(() => {
                let messageType = CONFIG_CONST.isRealInvest ? "真实投注" : "模拟投注";
                log.info('正在保存表%s %s记录...', EnumDbTableName.INVEST, messageType);
                //真实后模拟投注后 更新各个方案的账户余额
                return this.initAllPlanInvestInfo(EnumDbTableName.INVEST)
                    .then((allPlanInvestInfo: Array<InvestInfo>) => {
                        log.info('%s表 %s记录已保存', EnumDbTableName.INVEST, messageType);
                        //保存投注记录
                        return InvestTableService.saveOrUpdateInvestInfoListByTableName(EnumDbTableName.INVEST, allPlanInvestInfo);
                    })
                    .then(() => {
                        //表invest第一次初始化完毕 重置标识
                        if (Config.isInvestTableInitCompleted) Config.isInvestTableInitCompleted = false;

                        //发送invest表 投注提醒通知
                        if (AppSettings.investTableBuyNotification) return notificationService.sendBuyNumberNotification();
                    });
            })
            .then(() => {
                //当前期号
                let currentPeriod = Tencent75TimeService.getCurrentPeriodNumber(new Date());
                return InvestTableService.getInvestInfoByTableName(EnumDbTableName.INVEST, currentPeriod, CONFIG_CONST.currentSelectedInvestPlanType);
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
