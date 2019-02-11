import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {LotteryDbService} from "../../dbservices/ORMService";
import {InvestPushInfo} from "../../../models/db/InvestPushInfo";
import {CommonUtil} from "../../common/CommonUtil";
import {XGPushModel} from "../../../models/XGPushModel";
import {EnumPushPlatformType, EnumPushVendorType} from "../../../models/EnumModel";
import {ConstVars} from "../../../global/ConstVars";

let log4js = require('log4js'),
    log = log4js.getLogger('PushSender');

export class PushSender {
    /**
     *
     * 发送
     */
    public static async sendTencentXGPush(title: string, content: string): BlueBirdPromise<any> {
        return LotteryDbService.getInvestPushInfoHistory(1, EnumPushPlatformType.TENCENT_XG, EnumPushVendorType.TENCENT_XG)
            .then((investPushInfoArray: Array<InvestPushInfo>) => {
                if (investPushInfoArray.length == 0) return BlueBirdPromise.reject("invest_push table is empty.");

                let investPushInfo: InvestPushInfo = investPushInfoArray[0];
                let xGPushModel: XGPushModel = {
                    access_id: 2100320159,
                    timestamp: Math.round(new Date().getTime() / 1000), //Unix时间戳
                    device_token: investPushInfo.deviceToken,
                    message_type: 1,
                    message: "{\"content\":\"" + content + "\",\"title\":\"" + title + "\",\"vibrate\":1}",
                    sign: '',
                    expire_time: 43200
                };

                xGPushModel.sign = CommonUtil.getPushSign(title, content, xGPushModel);//产生push签名
                log.info("发送push需要的sign值=%s", xGPushModel.sign);
                let pushUrl: string = CommonUtil.getPushSignUrl(title, content, xGPushModel, xGPushModel.sign);
                log.info("push请求的url=%s", pushUrl);
                return CommonUtil.httpGet(pushUrl)
                    .then((res) => {
                        log.info("服务器接口返回信息：%s", res);
                    });
            })
            .catch((e) => {
                if (e) {
                    log.error("发送Push失败，当前时间：%s", moment().format(ConstVars.momentDateTimeFormatter));
                    log.error(e);
                }
            })
    }
}
