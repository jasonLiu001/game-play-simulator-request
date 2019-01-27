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
    //是否开启invest投注提醒
    public static investTableBuyNotification: boolean = false;
    //是否开启invest表最大错误数量提醒
    public static investTableMaxErrorCountNotification: number = 1;
    //最低利润预警值
    public static minProfitNotification: number = 4500;
    //最高利润预警
    public static maxProfitNotification: number = 7000;
    //真实投注截止时间
    public static realInvestEndTime: string = "21:59:00";
    //程序启动时 自动开启真实投注
    public static enableRealInvestWhenProgramStart: boolean = false;
    //上期错误进行邮件提醒，模拟+真实下都有效
    public static enableWarningNotification: boolean = false;
    //是否开启invest_total表投注提醒
    public static totalTableBuyNotification: boolean = false;
    //是否开启invest_total表 方案1 最大正确数量提醒
    public static totalTableMaxWinCountNotification_Plan01: number = 4;
    //是否开启invest_total表 方案1 最大错误数量提醒
    public static totalTableMaxErrorCountNotification_Plan01: number = 4;
    //是否开启invest_total表 方案2 最大正确数量提醒
    public static totalTableMaxWinCountNotification_Plan02: number = 4;
    //是否开启invest_total表 方案2 最大错误数量提醒
    public static totalTableMaxErrorCountNotification_Plan02: number = 4;
    //是否开启invest_total表 方案3 最大正确数量提醒
    public static totalTableMaxWinCountNotification_Plan03: number = 4;
    //是否开启invest_total表 方案3 最大错误数量提醒
    public static totalTableMaxErrorCountNotification_Plan03: number = 4;
    //停用对上期的开奖号码的形态的检查，允许每期都可以进行投注
    public static isStopCheckLastPrizeNumber: boolean = false;
    //是否停止连续投注提醒
    public static isStopSendContinueInvestWarnEmail: boolean = false;
    // 倍投元角分模式，支持多期，中间逗号分隔 如：100,10
    public static doubleInvest_AwardMode: string = '0';
    // 倍投投注倍数，支持多期，中间逗号分隔 如：1,2
    public static doubleInvest_TouZhuBeiShu: string = '0';
}
