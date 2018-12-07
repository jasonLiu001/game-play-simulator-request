import BlueBirdPromise = require('bluebird');
import {EMAIL_CONFIG} from "../../../config/Config";
import {PushService} from "./PushService";

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.host,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth
});

let log4js = require('log4js'),
    log = log4js.getLogger('NotificationSender');

/**
 *
 * 发送提醒 push+邮件
 */
export class NotificationSender {

    /**
     *
     * 发送提醒 push+邮件
     */
    public static send(subject: string, htmlContent: string): BlueBirdPromise<any> {
        // setup email data with unicode symbols
        let mailOptions = {
            from: EMAIL_CONFIG.from, // sender address
            to: EMAIL_CONFIG.to, // list of receivers
            subject: subject, // Subject line
            // text: 'Hello world?', // plain text body
            html: htmlContent // html body
        };

        let promiseArray: Array<BlueBirdPromise<any>> = [];
        promiseArray.push(PushService.send(subject, htmlContent));
        promiseArray.push(new BlueBirdPromise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                }

                resolve(info);
            })
        }));

        return BlueBirdPromise.all(promiseArray).catch((emailError) => {
            if (emailError) {
                log.error("提醒发送失败");
                log.error(emailError);
            }
        });
    }
}
