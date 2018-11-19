import _ = require('lodash');
import BlueBirdPromise = require('bluebird');
import {HttpRequestHeaders} from "../../models/EnumModel";

let log4js = require('log4js'),
    log = log4js.getLogger('CommonUtil'),
    request = require('request'),
    cheerio = require('cheerio');

/**
 *
 * 公用模块
 */
export class CommonUtil {
    /**
     *
     * 普通网络Get请求
     */
    get(dataUrl: string): BlueBirdPromise<any> {
        return new BlueBirdPromise((resolve, reject) => {
            request(
                {
                    uri: dataUrl,
                    headers: HttpRequestHeaders,
                    method: 'GET'
                }, (error, response, body) => {
                    if (error) {
                        log.error(error);
                        reject(error);
                    }

                    resolve(body);
                });
        })
    }
}