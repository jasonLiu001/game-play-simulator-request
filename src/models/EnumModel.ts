/**
 *
 * 投注模式元、角、分
 */
export const enum EnumAwardMode{
    //元模式
    yuan = 1,
        //角模式
    jiao = 10,
        //分模式
    feng = 100,
        //厘模式
    li = 1000
}

/**
 *
 * 杀号位置
 */
export const enum EnumKillNumberPosition{
    //个位
    geWei,

        //十位
    shiWei,

        //百位
    baiWei,
}

/**
 *
 * Promise的reject的消息字符
 */
export const enum RejectionMsg{
    //数据库已存在相关记录
    isExistRecordInAward = 'exist-record-in-award',
        //未达到下期的投注时间
    notReachInvestTime = 'not-reach-invest-time',
        //上期开奖号码未更新
    lastPrizeNumberNotUpdated = 'not-update-last-prize-number',
        //不允许投注
    canExecuteRealInvest = 'not-allow-execute-invest',
        //打开页面错误
    navigationError = 'navigation error',
        //开奖号码中的历史数据不够
    historyCountIsNotEnough = 'history-count-in-award-table-is-not-enough'
}