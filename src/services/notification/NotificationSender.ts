import BlueBirdPromise = require('bluebird');
import {PushSender} from "./sender/PushSender";
import {EmailSender} from "./sender/EmailSender";
import {SMSSender} from "./sender/SMSSender";
import {NotificationType} from "../../models/EnumModel";

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
    public static send(title: string, content: string, notificationType: NotificationType): BlueBirdPromise<any> {

        let promiseArray: Array<BlueBirdPromise<any>> = [];

        switch (notificationType) {
            case NotificationType.EMAIL:
                //发送e-mail
                promiseArray.push(EmailSender.send(title, content));
                break;
            case NotificationType.PUSH:
                //发送push
                promiseArray.push(PushSender.send(title, content));
                break;
            case NotificationType.PUSH_AND_EMAIL:
                //发送push
                promiseArray.push(PushSender.send(title, content));
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
