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
     * app启动异常处理
     */
    public static appStartErrorHandler(log: any, error: any): void {
        if (error) {
            log.error("程序启动时遇到错误，已退出！");
            log.error(error);
        }
    }

    /**
     *
     * app投注异常处理
     */
    public static appInvestErrorHandler(log: any, error: any): void {
        if (error) {
            log.error('投注已自动结束，原因如下：');
            log.error(error);
        }
    }
}