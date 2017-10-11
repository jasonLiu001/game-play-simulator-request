import {LotteryDbService} from "../dbservices/DBSerivice";
import {Config, CONFIG_CONST} from "../../config/Config";
import {NumberService} from "../numbers/NumberService";
import {InvestInfo} from "../../models/InvestInfo";
import Promise = require('bluebird');
import {TimerService} from "../timer/TimerService";
import {EnumAwardMode} from "../../models/EnumModel";


let log4js = require('log4js'),
    log = log4js.getLogger('AbstractInvestBase'),
    numberService = new NumberService(),
    timerService = new TimerService();

/**
 *
 * 投注接口
 */
export abstract class AbstractInvestBase {
    /**
     *
     * 获取期号字符中的期号 返回纯数字，如期号为20170629-005，返回结果为5
     */
    private getPeriodNumber(periodString: string): number {
        return Number(periodString.split('-')[1]);
    }

    /**
     *
     *
     * @param {String} prizeNumber 后三开奖号码
     * @param investNumbersArray
     * @param investInfo
     */
    private updateIsWinStatus(prizeNumber: string, investNumbersArray: Array<string>, investInfo: InvestInfo) {
        if (prizeNumber.length != 3 || prizeNumber == '') throw new Error('目前只支持后三开奖号码兑奖');

        for (let i = 0; i < investNumbersArray.length; i++) {
            let item = investNumbersArray[i];
            if (prizeNumber == item) {
                investInfo.isWin = 1;
                break;
            }
        }
    }

    private updateWinMoney(investNumbersArray: Array<string>, investInfo: InvestInfo) {
        //当前投入
        let investMoney = investNumbersArray.length * 2;
        //更新当前盈利
        if (investInfo.isWin == 1) {
            //当期盈利
            let winMoney = CONFIG_CONST.awardPrice - investMoney;
            investInfo.winMoney = winMoney / investInfo.awardMode;
        } else {
            investInfo.winMoney = (investMoney == 0) ? 0 : -(investMoney / investInfo.awardMode);
        }
    }


    private updateCurrentAccountBalace(investInfo: InvestInfo, config: Config) {
        //更新当前账号余额
        if (investInfo.isWin == 1) {
            investInfo.currentAccountBalance = Number((investInfo.currentAccountBalance + CONFIG_CONST.awardPrice / investInfo.awardMode).toFixed(2));
            //更新全局余额
            Config.globalVariable.currentAccoutBalance = investInfo.currentAccountBalance;
        }
    }

    /**
     *
     *
     * 检查是否可以执行真正的投注操作
     */
    private checkLastPrizeNumberValidation(config: Config): Promise<boolean> {
        //上期的开奖号码是否满足投注条件
        let isValid = numberService.isLastPrizeNumberValid(config);
        log.info('%s期开奖号码:%s，当前时间：%s', Config.globalVariable.last_Period, Config.globalVariable.last_PrizeNumber, new Date().toLocaleTimeString());
        log.info('当前%s期，任务执行中...', Config.globalVariable.current_Peroid);
        if (!isValid) {
            let errorMsg = Config.globalVariable.last_Period + '期号码:' + Config.globalVariable.last_PrizeNumber + '，不满足执行条件，放弃' + Config.globalVariable.current_Peroid + '期投注，本次任务执行完毕';
            //上期号码不满足条件时，则结束当前Promise调用链并返回
            return Promise.reject(errorMsg);
        }
        return Promise.resolve(true);
    }

    /**
     *
     * 检查投注时间 在02:00-10:00点之间不允许投注
     */
    private checkInvestTime(config: Config): Promise<any> {
        //检查在此时间内是否允许投注
        if (timerService.isInStopInvestTime()) {
            //更新开奖时间
            timerService.updateNextPeriodInvestTime(config, new Date(), CONFIG_CONST.openTimeDelaySeconds);
            return Promise.reject("当前时间：" + new Date().toLocaleDateString() + "，在02:00到10:00之间，不符合投注时间")
        }
        return Promise.resolve(true);
    }

    /**
     *
     * 根据当前选择的投注模式 转换金额
     */
    public convertMoneyFormat(money: number): number {
        let result: number;
        switch (Config.currentSelectedAwardMode) {
            case EnumAwardMode.yuan:
                result = money;
                break;
            case EnumAwardMode.jiao:
                result = Number((money / EnumAwardMode.jiao).toFixed(2));
                break;
            case EnumAwardMode.feng:
                result = Number((money / EnumAwardMode.feng).toFixed(2));
                break;
            case EnumAwardMode.li:
                result = Number((money / EnumAwardMode.li).toFixed(2));
                break;
            default:
                result = money;
                break;
        }

        return result;
    }

    /**
     *
     *
     * 检查最大盈利金额是否达到设定目标
     */
    private checkMaxWinMoney(config: Config, isMockTest: boolean): Promise<any> {
        if (Config.globalVariable.currentAccoutBalance >= CONFIG_CONST.maxWinMoney) {
            let message = "当前账号余额：" + Config.globalVariable.currentAccoutBalance + "，已达到目标金额：" + CONFIG_CONST.maxWinMoney;
            if (!isMockTest) {//真实投注
                return Promise.reject(message);
            }
        }
        return Promise.resolve(true);
    }


    /**
     *
     *
     * 是否可投注检查
     * @param config
     * @param isMockTest 是否是模拟测试
     */
    public doCheck(config: Config, isMockTest: boolean): Promise<boolean> {
        //检查开奖号码是否已经更新
        return this.checkLastPrizeNumberValidation(config)
            .then(() => {
                //检查投注时间 在02:00-10:00点之间不允许投注
                return this.checkInvestTime(config);
            })
            .then(() => {
                //检查当前的最大盈利金额
                return this.checkMaxWinMoney(config, isMockTest);
            });

    }

    /**
     *
     *
     * 初始化投注信息
     */
    public initInvestInfo(config: Config): InvestInfo {
        let investInfo: InvestInfo = {
            period: Config.globalVariable.current_Peroid,
            investNumbers: Config.currentInvestNumbers,
            currentAccountBalance: Config.globalVariable.currentAccoutBalance,
            investNumberCount: Config.currentInvestNumbers.split(',').length,
            awardMode: Config.currentSelectedAwardMode,
            winMoney: 0,
            status: 0,
            isWin: 0,
            investTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        };
        return investInfo;
    }

    /**
     *
     *
     * 计算上期盈亏
     */
    public calculateWinMoney(lotteryDbService: LotteryDbService, config: Config): Promise<any> {
        return lotteryDbService.getInvestInfoListByStatus(0)
            .then((resultList) => {
                if (!resultList) Promise.resolve(true);
                let investInfoList = [];
                log.info('查询到未开奖数据%s条', resultList.length);
                for (let i = 0; i < resultList.length; i++) {
                    let item = resultList[i];
                    let investInfo: InvestInfo = {
                        period: item.period,
                        investNumbers: item.investNumbers,
                        currentAccountBalance: item.currentAccountBalance,
                        investNumberCount: item.investNumberCount,
                        awardMode: item.awardMode,
                        winMoney: item.winMoney,
                        status: item.status,
                        isWin: item.isWin,
                        investTime: item.investTime
                    };
                    //后三开奖号码
                    let prizeNumber = item.openNumber.substring(2);
                    //兑奖
                    this.UpdatePrize(investInfo, prizeNumber, config);
                    investInfoList.push(investInfo);
                }

                //首先更新之前未开奖的数据
                return lotteryDbService.saveOrUpdateInvestInfoList(investInfoList);
            })
            .then((results) => {
                log.info('已更新未开奖数据%s条', results.length);
                return Promise.resolve(true);
            });
    }

    /**
     *
     *
     * 兑奖
     * @param investInfo
     * @param openNumber
     * @param config
     * @return {Array|string[]}
     */
    private UpdatePrize(investInfo: InvestInfo, openNumber: string, config: Config): void {
        //投注号码数组
        let investNumbersArray = (investInfo.investNumbers == "") ? [] : investInfo.investNumbers.split(',');
        //更新中奖状态
        this.updateIsWinStatus(openNumber, investNumbersArray, investInfo);
        //更新当前盈利
        this.updateWinMoney(investNumbersArray, investInfo);
        //更新当前账号余额
        this.updateCurrentAccountBalace(investInfo, config);
        //更新开奖状态
        investInfo.status = 1;//已开奖
    }

    /**
     *
     *
     * 正式投注成功后台 更新投注后的账户余额
     */
    public updateCurrentAccountBalance(config: Config, lotteryDbService: LotteryDbService): void {
        //投注号码数组
        let investNumbersArray = (Config.currentInvestNumbers == "") ? [] : Config.currentInvestNumbers.split(',');
        //当前投入
        let investMoney = investNumbersArray.length * 2;
        //投注前保存 投注后的账号余额
        Config.globalVariable.currentAccoutBalance = Number((Config.globalVariable.currentAccoutBalance - (investMoney / Config.currentSelectedAwardMode)).toFixed(2));

    }
}