import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {LotteryDbService} from "../../dbservices/ORMService";
import {EnumSMSTemplateType, EnumVendorType} from "../../../models/EnumModel";
import {VendorInfo} from "../../../models/db/VendorInfo";
import {CONFIG_CONST} from "../../../config/Config";

let log4js = require('log4js'),
    log = log4js.getLogger('SMSSender'),
    QcloudSms = require("qcloudsms_js");

/**
 *
 * 发送短信
 */
export class SMSSender {
    /**
     *
     * 发送  templateId 7839 对应的内容是"登录成功！账号ID: {1} 昵称：{2}，登录服务器名称：{3}"
     * @param templateVar1 短信正文模板变量1
     * @param templateVar2 短信正文模板变量2
     * @param templateVar3 短信正文模板变量3
     * @param smsSign 签名 短信签名 NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`
     * @param templateId 短信模板ID，需要在短信应用中申请  NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
     */
    public static async send(templateVar1: string, templateVar2: string, templateVar3: string, smsSign: string, templateId: EnumSMSTemplateType): BlueBirdPromise<any> {
        //数组具体的元素个数和模板中变量个数必须一致，例如事例中templateId:5678对应一个变量，参数数组中元素个数也必须是一个
        let params = [templateVar1, templateVar2, templateVar3];

        let promiseArray: Array<BlueBirdPromise<VendorInfo>> = [];
        promiseArray.push(LotteryDbService.getVendorInfo(EnumVendorType.TencentSMS));
        promiseArray.push(LotteryDbService.getVendorInfo(EnumVendorType.UserPhone));
        return BlueBirdPromise.all(promiseArray)
            .then((vendorList: Array<VendorInfo>) => {
                let tencentSMSVendor: VendorInfo = vendorList[0];
                let userPhone: VendorInfo = vendorList[1];
                // 需要发送短信的手机号码
                let phoneNumbers = [userPhone.key];
                // 短信应用SDK AppID
                let appid = tencentSMSVendor.key;  // SDK AppID是1400开头
                // 短信应用SDK AppKey
                let appkey = tencentSMSVendor.value;
                // 实例化QcloudSms
                let qcloudsms = QcloudSms(appid, appkey);
                let ssender = qcloudsms.SmsSingleSender();
                return new BlueBirdPromise<any>((resolve, reject) => {
                    ssender.sendWithParam(86, phoneNumbers[0], templateId,
                        params, smsSign, "", "", (err, res, resData) => {
                            if (err) {
                                log.error(err);
                                reject(err);
                            } else {
                                resolve(resData);
                                log.info(resData);
                            }
                        });  // 签名参数未提供或者为空时，会使用默认签名发送短信
                })
            })
            .catch((e) => {
                if (e) {
                    log.error("发送短信失败，当前时间：%s", moment().format('YYYY-MM-DD HH:mm:ss'));
                    log.error(e);
                }
            });
    }
}
