import _ = require('lodash');
import BlueBirdPromise = require('bluebird');
import {GlobalRequest} from "../../global/GlobalRequest";
import {XGPushModel} from "../../models/XGPushModel";

let log4js = require('log4js'),
    log = log4js.getLogger('CommonUtil'),
    MD5 = require('crypto').createHash("md5");

/**
 *
 * 公用模块
 */
export class CommonUtil {
    /**
     *
     *
     * Http的Get请求
     */
    public static async httpGet(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            GlobalRequest.request(
                {
                    url: url,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                });
        });
    }

    /**
     *
     * 产生推送签名
     */
    public static getPushSign(title: string, content: string, xGPushModel: XGPushModel): string {
        let signContent: string = "GETopenapi.xg.qq.com/v2/push/single_deviceaccess_id=" + xGPushModel.access_id
            + "device_token=" + xGPushModel.device_token
            + "message={\"content\":\"" + content + "\",\"title\":\"" + title + "\",\"vibrate\":1}"
            + "message_type=1timestamp=" + xGPushModel.timestamp + "c1369ba97745d6be140346593c161bc3";
        log.info("MD5加密前：%s", signContent);
        MD5.update(signContent);
        return MD5.digest('hex').toLowerCase();
    }

    /**
     *
     * 产生推送url
     *
     * 请求的url中，如果包含中文，一定记得要编码
     */
    public static getPushSignUrl(title: string, content: string, xGPushModel: XGPushModel, sign: string): string {
        return "http://openapi.xg.qq.com/v2/push/single_device?access_id="
            + xGPushModel.access_id + "&timestamp=" + xGPushModel.timestamp + "&device_token=" + xGPushModel.device_token
            + "&message_type=1&message=" + encodeURIComponent("{\"content\":\"" + content + "\",\"title\":\"" + title + "\",\"vibrate\":1}") + "&sign=" + encodeURIComponent(sign);
    }
}
