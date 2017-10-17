import {RejectionMsg} from "../models/EnumModel";
/**
 *
 *
 * 错误处理服务
 */
export class ErrorService {
    /**
     *
     *
     * app异常处理
     */
    public static appErrorHandler(log: any, error: any): void {
        if (error) {
            let msg = "程序启动时遇到错误，已退出！";
            log.error(msg);
            log.error(error);
        }
    }
}