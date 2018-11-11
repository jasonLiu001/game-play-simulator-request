/**
 *
 * 程序运行时变量配置
 */
export class AppSettings {
    //初始余额是否为上期余额
    public static isUseLastAccountBalance: boolean = false;
    //是否模拟投注时根据情况自行投注
    public static isEnableInvestInMock: boolean = false;
    //是否用相反的投注号码进行投注
    public static isUseReverseInvestNumbers: boolean = false;
    //是否开启投注提醒
    public static investNotification: boolean = false;
    //最低利润预警值
    public static minProfitNotification: number = 4500;
    //最高利润预警
    public static maxProfitNotification: number = 7000;
    //自动投注截止时间
    public static investEndTime: string = "21:59:00";
    //程序启动时 自动开启真实投注
    public static enableRealInvestWhenProgramStart: boolean = false;
    //停用对上期的开奖号码的形态的检查，允许每期都可以进行投注
    public static isStopCheckLastPrizeNumber: boolean = false;
}
