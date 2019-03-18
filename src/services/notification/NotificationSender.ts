import BlueBirdPromise = require('bluebird');
import {PushSender} from "./sender/PushSender";
import {EmailSender} from "./sender/EmailSender";
import {EnumNotificationType} from "../../models/EnumModel";

let log4js = require('log4js'),
    log = log4js.getLogger('NotificationSender');

/**
 *
 * 发送提醒 多种方式
 */
export class NotificationSender {

    /**
     *
     * 发送提醒 多种方式
     */
    static send(title: string, content: string, notificationType: EnumNotificationType): BlueBirdPromise<any> {

        let promiseArray: Array<BlueBirdPromise<any>> = [];

        switch (notificationType) {
            case EnumNotificationType.EMAIL:
                //发送e-mail
                promiseArray.push(EmailSender.send(title, content));
                break;
            case EnumNotificationType.PUSH:
                //发送push
                promiseArray.push(PushSender.sendTencentXGPush(title, content));
                break;
            case EnumNotificationType.PUSH_AND_EMAIL:
                //发送push
                promiseArray.push(PushSender.sendTencentXGPush(title, content));
                //发送e-mail
                promiseArray.push(EmailSender.send(title, content));
                break;
            default:
                //发送e-mail
                promiseArray.push(EmailSender.send(title, content));
                break;
        }

        return BlueBirdPromise.all(promiseArray).catch((emailError) => {
            if (emailError) {
                log.error("提醒发送失败");
                log.error(emailError);
            }
        });
    }
}
