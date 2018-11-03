import BlueBirdPromise = require('bluebird');
import {InvestService} from "./invest/InvestService";
import {ErrorService} from "./ErrorService";
import {CONFIG_CONST} from "../config/Config";
import {HttpRequestHeaders} from "../models/EnumModel";
import {LotteryDbService} from "./dbservices/ORMService";
import {AwardService} from "./award/AwardService";
import {SettingsInfo, update_isRealInvest_to_real} from "../models/db/SettingsInfo";
import {SettingService} from "./settings/SettingService";
import {AppSettings} from "../config/AppSettings";

let Request = require('request'), path = require('path');

let log4js = require('log4js');
log4js.configure(path.resolve(__dirname, '..', 'config/log4js.json'));

let log = log4js.getLogger('AppServices'),
    investService = new InvestService(),
    cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: CONFIG_CONST.autoCheckTimerInterval,
            headers: HttpRequestHeaders,
            strictSSL: false//解决:unable to verify the first certificat 参考https://github.com/request/request/issues/2505
        });


/**
 *
 * App主服务入口
 */
export class AppServices {
    /**
     *
     *
     * 启动程序，自动获取开奖号码并投注
     */
    public static async start(): BlueBirdPromise<any> {
        log.info('程序已启动，持续监视中...');
        return LotteryDbService.createLotteryTable()
            .then(() => {
                //程序启动时 必须首先要获取的参数配置信息 originAccountBalance,currentAccountBalance,currentSelectedAwardMode
                return SettingService.getAndInitSettings()
                    .then((settingInfoList: Array<SettingsInfo>) => {
                        for (let index in settingInfoList) {
                            let item = settingInfoList[index];
                            if (item.key === 'originAccountBalance') {
                                //这里不需要 每次都设置初始余额 只在程序启动时赋值一次即可
                                CONFIG_CONST.originAccountBalance = Number(item.value);
                            }
                        }
                    });
            })
            .then(() => {
                if (AppSettings.enableRealInvestWhenProgramStart) {//程序启动时 开启真实投注
                    //切换到模拟投注
                    CONFIG_CONST.isRealInvest = true;
                    //自动切换到真实投注
                    return LotteryDbService.saveOrUpdate_UpdateSettingsInfo(update_isRealInvest_to_real);

                }
            })
            .then(() => {
                //启动获取奖号任务 间隔特定时间获取号码 奖号更新成功后 自动投注
                AwardService.startGetAwardInfoTask(() => {
                    //投注前 首先获取参数配置信息
                    SettingService.getAndInitSettings()
                        .then(() => {
                            return investService.executeAutoInvest(request);//执行投注
                        });
                });
            })
            .catch((err) => {
                ErrorService.appStartErrorHandler(log, err);
            });
    }
}
