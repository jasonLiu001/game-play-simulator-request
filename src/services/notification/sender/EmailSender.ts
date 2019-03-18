import BlueBirdPromise = require('bluebird');
import {EMAIL_CONFIG} from "../../../config/Config";

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.host,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth
});

let log4js = require('log4js'),
    log = log4js.getLogger('EmailSender');

/**
 *
 * 发送邮件
 */
export class EmailSender {

    /**
     *
     * 发送邮件
     */
    static async send(title: string, content: string): BlueBirdPromise<any> {
        // setup email data with unicode symbols
        let mailOptions = {
            from: EMAIL_CONFIG.from, // sender address
            to: EMAIL_CONFIG.to, // list of receivers
            subject: title, // Subject line
            // text: 'Hello world?', // plain text body
            html: content // html body
        };

        return new BlueBirdPromise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    log.error(error);
                    reject(error);
                }

                resolve(info);
            });
        });
    }
}
