import Promise = require('bluebird');
export class PlatformAbstractBase {
    /**
     *
     *
     * Http的Get请求
     */
    public httpGet(request: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            request.get(
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

    /**
     *
     *
     * Http的Post请求
     */
    public httpPost(request: any, url: string, form: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            request.post(
                {
                    url: url,
                    form: form
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(body);
                }
            );
        });
    }
}