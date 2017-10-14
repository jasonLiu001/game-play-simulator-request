import {RejectionMsg} from "../../models/EnumModel";
/**
 *
 *
 * 错误处理服务
 */
export class ErrorService {
    /**
     *
     * 执行投注时的错误过滤并输出，过滤不需要输出的错误信息
     */
    public static executeInvestErrorHandler(log: any, error: any): void {
        //跳过特定的错误输出信息，不需要输出到控制台
        if (error && error == RejectionMsg.notReachInvestTime) return;
        if (error && error == RejectionMsg.lastPrizeNumberNotUpdated) return;
        if (error && error == RejectionMsg.canExecuteRealInvest) return;

        if (error) {
            log.error('任务结束');
            log.error(error);
        }
    }

    /**
     *
     *
     * app异常处理
     */
    public static appErrorHandler(log: any, error: any): void {
        if (error && error.message && error.message == RejectionMsg.navigationError) log.error(error.message);

        if (error) {
            let msg = "程序启动时遇到错误，已退出！";
            log.error(msg);
            log.error(error);
        }
    }
}