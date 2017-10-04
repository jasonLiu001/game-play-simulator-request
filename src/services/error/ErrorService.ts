import {Config} from "../../config/Config";
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
    public executeInvestErrorHandler(log: any, error: any, config: Config): void {
        //跳过特定的错误输出信息，不需要输出到控制台
        if (error && error == config.rejectionMsg.notReachInvestTime) return;
        if (error && error == config.rejectionMsg.lastPrizeNumberNotUpdated) return;
        if (error && error == config.rejectionMsg.canExecuteRealInvest) return;

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
    public appErrorHandler(nightmare: any, log: any, error: any, config: Config): void {
        if (error && error.message && error.message == config.rejectionMsg.navigationError) log.error(error.message);

        if (error) {
            let msg = "程序启动时遇到错误，已退出！";
            if (nightmare) {
                nightmare.end(() => {
                    log.error(msg);
                    log.error(error);
                });
            } else {
                log.error(msg);
                log.error(error);
            }

        }
    }
}