import {Config, CONFIG_CONST} from "../../config/Config";
import {InvestInfo} from "../../models/db/InvestInfo";
import BlueBirdPromise = require('bluebird');
import {JiangNanLoginService} from "./jiangnan/JiangNanLoginService";
import {JiangNanLotteryService} from "./jiangnan/JiangNanLotteryService";
import moment  = require('moment');
import {AppSettings} from "../../config/AppSettings";
import {EmailSender} from "../email/EmailSender";

let log4js = require('log4js'),
    log = log4js.getLogger('PlatformService'),
    jiangNanLoginService = new JiangNanLoginService(),
    jiangNanLotteryService = new JiangNanLotteryService;

/**
 *
 * 平台投注和登录服务
 */
export class PlatformService {
    /**
     *
     * 登录平台并执行真实投注
     * @param request
     * @param investInfo
     */
    public static async loginAndInvest(request: any, investInfo: InvestInfo): BlueBirdPromise<any> {
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