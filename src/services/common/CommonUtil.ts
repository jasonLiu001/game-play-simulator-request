import _ = require('lodash');
import BlueBirdPromise = require('bluebird');
import {GlobalRequest} from "../../global/GlobalRequest";

let log4js = require('log4js'),
    log = log4js.getLogger('CommonUtil');

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
            GlobalRequest.request.get(
                {
                    url: url
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                });
        });
    }
}
