/**
 *
 * 程序运行时变量配置
 */
export class AppSettings {
    //初始余额是否为上期余额
    public static isUseLastAccountBalance = false;
    //是否模拟投注时根据情况自行投注
    public static isEnableInvestInMock = false;
    //是否用相反的投注号码进行投注
    public static isUseReverseInvestNumbers = false;
    //最低利润预警值
    public static minProfitNotification: number = 4500;
    //最高利润预警
    public static maxProfitNotification: number = 7000;
    //自动投注截止时间
    public static investEndTime: string = "21:59:00";
}
