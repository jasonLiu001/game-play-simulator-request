/**
 *
 * 全局常量
 */
export const ConstVars = {
    //moment.js 日期+时间 格式化字符
    momentDateTimeFormatter: 'YYYY-MM-DD HH:mm:ss',
    //moment.js 日期 格式化字符
    momentDateFormatter: 'YYYY-MM-DD',
    //moment.js 时间 格式化字符
    momentTimeFormatter: 'HH:mm:ss'
};

/**
 *
 * 设置表初始化数据
 */
export const SettingTableInitData = [
    {
        key: 'isRealInvest',
        value: '0',
        orderId: '1',
        group: 'system',
        desc: '开启真实投注模式 1:真实 0:模拟',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'enableRealInvestWhenProgramStart',
        value: '0',
        orderId: '2',
        group: 'system',
        desc: '在程序启动且未达盈利目标，自主进入真实投注，如当天【重启程序】时需要关闭此项',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'awardMode',
        value: '10',
        orderId: '3',
        group: 'system',
        desc: '元、角、分、厘模式',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'touZhuBeiShu',
        value: '1',
        orderId: '4',
        group: 'system',
        desc: '投注倍数',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'originAccountBalance',
        value: '5000',
        orderId: '5',
        group: 'system',
        desc: '账户初始余额',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'maxAccountBalance',
        value: '5100',
        orderId: '6',
        group: 'system',
        desc: 'invest表当天最大盈利目标金额',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'minAccountBalance',
        value: '0',
        orderId: '7',
        group: 'system',
        desc: 'invest表当天最大亏损金额',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'realInvestEndTime',
        value: '21:59:00',
        orderId: '8',
        group: 'system',
        desc: '真实投注终止投注截止时间如21:59:00，0表示无限制，优先级高于最大利润',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'currentSelectedInvestPlanType',
        value: '1',
        orderId: '9',
        group: 'system',
        desc: '当前选择的投注方案类型',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'isUseLastAccountBalance',
        value: '0',
        orderId: '10',
        group: 'system',
        desc: '每次程序启动时初始余额自动设置为上期余额，当天【重启程序】时需要开启此项',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'investTableBuyNotification',
        value: '0',
        orderId: '11',
        group: 'investTableNotification_alone',
        desc: 'invest表投注提醒，每期投注都进行邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '独立通知，不受通知总开关控制'
    },
    {
        key: 'enableWarningNotification',
        value: '0',
        orderId: '12',
        group: 'notificationControlCenter',
        desc: '是否开启预警提醒',
        isEnable: 1,
        remark: '通知的总开关，group属性值带alone的不受该值控制，表示独立控制的意思'
    },
    {
        key: 'maxProfitNotification',
        value: '0',
        orderId: '13',
        group: 'investTableNotification',
        desc: 'invest表达到最高利润值后邮件预警，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'minProfitNotification',
        value: '0',
        orderId: '14',
        group: 'investTableNotification',
        desc: 'invest表达到最低利润值后邮件预警，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'isEnableInvestInMock',
        value: '0',
        orderId: '15',
        group: 'warning',
        desc: 'invest表遇【对错错】进入真实投注，直到盈利转模拟，不受最大盈利约束 模拟+正向投注时生效',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'isUseReverseInvestNumbers',
        value: '0',
        orderId: '16',
        group: 'warning',
        desc: '【慎用】使用相反的号码投注',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'siteUrl',
        value: 'https://123.jn704.com',
        orderId: '17',
        group: 'system',
        desc: '网站首页地址',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'isStopCheckLastPrizeNumber',
        value: '0',
        orderId: '18',
        group: 'warning',
        desc: '【慎用】停用对上期的开奖号码的形态的检查，允许每期都可以进行投注',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'investTableMaxErrorCountNotification',
        value: '1',
        orderId: '19',
        group: 'investTableNotification',
        desc: 'invest表最大错误数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'isStopSendContinueInvestWarnEmail',
        value: '0',
        orderId: '20',
        group: 'investTableNotification_alone',
        desc: 'invest表停止暂停投注提醒，真实下都有效',
        isEnable: 1,
        remark: '独立通知，不受通知总开关控制'
    },
    {
        key: 'totalTableBuyNotification',
        value: '0',
        orderId: '21',
        group: 'investTotalTableNotification_alone',
        desc: 'total表投注提醒，每期投注都进行邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '独立通知，不受通知总开关控制'
    },
    {
        key: 'totalTableMaxWinCountNotification_Plan01',
        value: '4',
        orderId: '22',
        group: 'investTotalTableNotification',
        desc: 'total表【方案1】最大正确数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'totalTableMaxErrorCountNotification_Plan01',
        value: '4',
        orderId: '23',
        group: 'investTotalTableNotification',
        desc: 'total表【方案1】最大错误数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'totalTableMaxWinCountNotification_Plan02',
        value: '4',
        orderId: '24',
        group: 'investTotalTableNotification',
        desc: 'total表【方案2】最大正确数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'totalTableMaxErrorCountNotification_Plan02',
        value: '4',
        orderId: '25',
        group: 'investTotalTableNotification',
        desc: 'total表【方案2】最大错误数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'totalTableMaxWinCountNotification_Plan03',
        value: '4',
        orderId: '26',
        group: 'investTotalTableNotification',
        desc: 'total表【方案3】最大正确数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'totalTableMaxErrorCountNotification_Plan03',
        value: '4',
        orderId: '27',
        group: 'investTotalTableNotification',
        desc: 'total表【方案3】最大错误数量邮件提醒，模拟+真实下都有效',
        isEnable: 1,
        remark: '依赖通知总开关'
    },
    {
        key: 'doubleInvest_AwardMode',
        value: '0',
        orderId: '28',
        group: 'doubleInvest',
        desc: '倍投元角分模式逗号分隔，支持total表多期，模拟投注下有效，如: 100,10',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'doubleInvest_TouZhuBeiShu',
        value: '0',
        orderId: '29',
        group: 'doubleInvest',
        desc: '倍投投注倍数逗号分隔，支持total表多期，模拟投注下有效，如：5,1',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'doubleInvest_IsUseReverseInvestNumbers',
        value: '0',
        orderId: '30',
        group: 'doubleInvest',
        desc: '倍投时是否取相反的号码，模拟投注下有效',
        isEnable: 1,
        remark: ''
    },
    {
        key: 'doubleInvest_CurrentSelectedInvestPlanType',
        value: '1',
        orderId: '31',
        group: 'doubleInvest',
        desc: '倍投时选取的投注方案，模拟投注下有效',
        isEnable: 1,
        remark: ''
    }
];