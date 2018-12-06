import BlueBirdPromise = require('bluebird');
import {EMAIL_CONFIG} from "../../config/Config";
import {PushService} from "../push/PushService";

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
 * 发送邮件
 */
export class NotificationSender {

    /**
     *
     * 发送邮件
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

        return PushService.send(subject, htmlContent)
            .then(() => {
                return new BlueBirdPromise((resolve, reject) => {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                        }

                        resolve(info);
                    })
                })
            })
            .catch((emailError) => {
                if (emailError) {
                    log.error("发送提醒邮失败");
                    log.error(emailError);
                }
            });
    }
}
