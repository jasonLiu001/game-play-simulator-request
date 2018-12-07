/**
 *
 * 投注模式元、角、分
 */
import {CONFIG_CONST} from "../config/Config";

export const enum EnumAwardMode {
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
export const enum EnumKillNumberPosition {
    //个位
    geWei = "个",

    //十位
    shiWei = "十",

    //百位
    baiWei = "百",
}

/**
 *
 * Promise的reject的消息字符
 */
export const enum RejectionMsg {
    //数据库已存在相关记录 上期开奖号码未更新
    isExistRecordInAward = 'exist-record-in-award. waiting for new prize number come out.',
    //奖号未更新
    prizeNumberNotUpdated = "prize number not update yet. waiting for new prize number come out",
    //未达到下期的投注时间
    notReachInvestTime = 'not-reach-invest-time',
    //开奖号码中的历史数据不够
    historyCountIsNotEnough = 'history-count-in-award-table-is-not-enough'
}

/**
 *
 *
 * 模拟的http请求头
 */
export const HttpRequestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': CONFIG_CONST.siteUrl,
    'Connection': 'keep-alive'
};

/**
 *
 * 厂商类型  表vendor中的类型
 */
export const enum EnumVendorType {
    /**
     *
     * 腾讯云短信服务
     */
    TencentSMS = 'TencentSMS',

    /**
     *
     * 接收短信的用户手机号
     */
    UserPhone = 'UserPhone'
}

/**
 *
 * push厂商 表invest_push中的类型
 */
export const enum EnumPushVendorType {
    /**
     *
     * 华为
     */
    HUA_WEI = 'HUA_WEI',

    /**
     *
     * 腾讯信鸽
     */
    TENCENT_XG = 'TENCENT_XG'
}

/**
 *
 * 发送的通知类型
 */
export const enum NotificationType {
    /**
     *
     * push通知
     */
    PUSH = "push",

    /**
     *
     * 短信通知
     */
    SMS = "sms",

    /**
     *
     * 邮件通知
     */
    EMAIL = "email",

    /**
     *
     * push和email通知
     */
    PUSH_AND_EMAIL = "push_and_email",

    /**
     *
     * 短信和email通知
     */
    SMS_AND_EMAIL = "sms_and_email",

    /**
     *
     * push sms email 通知
     */
    PUSH_AND_SMS_AND_EMAIL = ""
}
