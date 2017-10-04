export class GlobalVariable {
    //当前账号余额
    currentAccoutBalance: number = 0;
    //上期开奖号码
    last_PrizeNumber: string;
    //下期投注时间
    nextPeriodInvestTime: Date;
    //上期期号
    last_Period: string;
    //本期期号 格式：20170715-077
    current_Peroid: string;
}