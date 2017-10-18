import {LotteryDbService} from "../dbservices/DBSerivice";
import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import Promise = require('bluebird');
import {AbstractInvestBase} from "./AbstractInvestBase";
import {RequestLoginService} from "../platform/RequestLoginService";
import {RequestPlatformService} from "../platform/RequestPlatformService";
import {NumberService} from "../numbers/NumberService";
import {ErrorService} from "../ErrorService";


let log4js = require('log4js'),
    log = log4js.getLogger('InvestService'),
    requestLoginService = new RequestLoginService(),
    requestPlatformService = new RequestPlatformService,
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
                //检查是否满足投注条件
                return this.doCheck(isRealInvest);
            })
            .then(() => {
                log.info('%s', (isRealInvest ? '正式投注执行中...' : '模拟投注执行中...'));
                log.info('投注前账户余额：%s', Config.globalVariable.currentAccoutBalance);
                log.info('正在产生投注号码...');
                return numberService.generateInvestNumber();
            })
            .then((investNumbers: string) => {
                log.info('投注号码已生成！');
                //投注前保存 投注号码
                Config.currentInvestNumbers = investNumbers;
                //真实投注执行登录操作
                if (isRealInvest) {
                    log.info('正在执行登录...');
                    //使用request投注 需要先登录在投注 每次投注前都需要登录
                    return requestLoginService.login(request);
                }
            })
            .then(() => {
                //真实投注
                if (isRealInvest) {
                    log.info('登录成功！');
                    log.info('正在执行投注...');
                    return requestPlatformService.invest(request, CONFIG_CONST.touZhuBeiShu);
                }
            })
            .then((result) => {
                if (result) log.info(result);
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
                ErrorService.appInvestErrorHandler(log, e);
            });
    }
}