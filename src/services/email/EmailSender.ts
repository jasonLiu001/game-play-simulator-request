import Promise = require('bluebird');
import {EMAIL_CONFIG} from "../../config/Config";

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
    public static sendEmail(subject: string, htmlContent: string): Promise<any> {
        // setup email data with unicode symbols
        let mailOptions = {
            from: EMAIL_CONFIG.from, // sender address
            to: EMAIL_CONFIG.to, // list of receivers
            subject: subject, // Subject line
            // text: 'Hello world?', // plain text body
            html: htmlContent // html body
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                }

                resolve(info);
            })
        });
    }
}