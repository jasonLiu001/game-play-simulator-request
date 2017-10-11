/*
 * 超级鹰 http 接口(上传)，node.js 示例代码  http://www.chaojiying.com/
 * 注意：需要安装restler : npm install restler
 */
import {ResponseData} from "../../models/ResponseData";
import {Config, CONFIG_CONST} from "../../config/Config";
import Promise = require('bluebird');

let fs = require('fs'),
    request = require("request");

export class CaptchaDecoderService {
    public decoder(): Promise<ResponseData> {
        return new Promise((resolve, reject) => {
            let formData = {
                'user': CONFIG_CONST.username,
                'pass': CONFIG_CONST.password,
                'softid': '893450',//软件ID 可在用户中心生成
                'codetype': '1902',  //验证码类型 http://www.chaojiying.com/price.html 选择
                'userfile': fs.createReadStream(Config.captchaImgSavePath)// captchaImgSavePath: 抓取回来的码证码图片文件
            };

            request.post({
                url: 'http://upload.chaojiying.net/Upload/Processing.php',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData: formData
            }, function (err, response, body) {
                if (err) reject(err);
                resolve(JSON.parse(body));
            })
        });
    }
}