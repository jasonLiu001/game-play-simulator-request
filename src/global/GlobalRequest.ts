import {HttpRequestHeaders} from "../models/EnumModel";
import {CONFIG_CONST} from "../config/Config";

let Request = require('request');

let cookie = Request.jar(),
    request = Request.defaults(
        {
            jar: cookie,
            timeout: CONFIG_CONST.autoCheckTimerInterval,
            headers: HttpRequestHeaders,
            strictSSL: false//解决:unable to verify the first certificat 参考https://github.com/request/request/issues/2505
        });

/**
 *
 * 全局的Request对象
 */
export class GlobalRequest {
    public static request: any = request;
}
