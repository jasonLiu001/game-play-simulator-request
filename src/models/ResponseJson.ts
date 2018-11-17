/**
 *
 * Json 响应对象
 */
export class ResponseJson {
    status: number;//-1:失败 1:成功
    message: string;//状态说明
    data: any;//响应体数据


    /**
     *
     * 失败
     * @param errMsg 失败消息
     * @param data 失败数据
     */
    fail(errMsg: string, data: any = {}): void {
        this.status = -1;
        this.message = errMsg;
        this.data = data;
    }

    /**
     *
     * 成功
     * @param message 成功消息
     * @param data 成功数据
     */
    success(message: string, data: any = {}): void {
        this.status = 1;
        this.message = message;
        this.data = data;
    }
}