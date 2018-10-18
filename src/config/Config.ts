import {EnumAwardMode} from "../models/EnumModel";
import {SettingsInfo} from "../models/db/SettingsInfo";

let path = require('path');

/**
 *
 * 模拟投注参数实体
 * 这里设置这个对象的原因是因为saveOrUpdateSettingsInfo方法的参数需要传递一个SettingInfo对象才能利用Sequelize中的方法
 */
export const IS_INVEST_SETTING_MODEL: SettingsInfo = {
    key: 'isRealInvest',
    value: '0',
    desc: '是否是真实投注'
};

/**
 *
 * 邮件配置
 */
export const EMAIL_CONFIG = {
    //邮件服务器地址
    host: 'smtp.139.com',
    //邮件服务器端口
    port: 465,
    secure: true,//true for 465, false for other ports
    //用户名及密码
    auth: {
        user: 'yourusername@139.com',
        pass: ''
    },
    //发送人
    from: '"小刘" <yourusername@139.com>',
    //收件人
    to: '522914767@qq.com'
};

/**
 *
 * 常量
 */
export const CONFIG_CONST = {
    //登录网站url
    siteUrl: 'https://123.jn716.com',
    //需要获取的历史号码数量
    historyCount: 3,
    //开奖延迟时间，单位为秒
    openTimeDelaySeconds: 60,
    //自动检查定时器 时间间隔 单位为毫秒ms
    autoCheckTimerInterval: 25000,
    //三星奖金
    awardPrice: 1954,
    //是否真实投注 1:true真实投注  0:false模拟投注
    isRealInvest: false,
    //当前选择的投注方案类型
    currentSelectedInvestPlanType: 1,
    //投注倍数
    touZhuBeiShu: '1',
    //登录用户名
    username: '',
    //登录密码
    password: '',
    //元、角、分、厘模式
    awardMode: EnumAwardMode.feng,//yuan,jiao,feng,li
    //账户初始余额
    originAccountBalance: 100,
    //账号最大值 盈利金额设置 单位为元  比如：需要盈利120，则设置成620，这里不能设置
    maxAccountBalance: 120,
    //账号最小值 亏损金额设置 单位为元  比如：账户当前最低余额
    minAccountBalance: 0
};

/**
 *
 * @summary 配置文件
 * */
export class Config {
    //保存的验证码图片本地路径
    public static captchaImgSavePath: string = path.resolve(__dirname, "..", "captcha.jpeg");
    //是否用相反的投注号码进行投注
    public static isUseReverseInvestNumbers = false;
    //invest_total表 初始余额是否为上期余额
    public static isInvestTotalTableUseLastAccountBalance = false;
    //invest表 初始余额是否为上期余额
    public static isInvestTableUserLastAccountBalance = false;
    //invest_total表是否第一次初始化完毕
    public static isInvestTotalTableInitCompleted: boolean = true;
    //invest表是否第一次初始化完毕
    public static isInvestTableInitCompleted: boolean = true;
    //当前已经实际投注的期数
    public static currentInvestTotalCount: number = 0;
    //开奖号更新计时器
    public static awardTimer: any = null;
    //是否第一次出现连错
    public static isContinueWrongForFirstTime: boolean = false;
    //全局变量 程序运行时可变
    public static globalVariable: any = {
        last_Period: null, //上期期号 程序运行时初始化
        last_PrizeNumber: null, //上期开奖号码 程序运行时初始化
        nextPeriodInvestTime: null, //下期投注时间 程序运行时初始化
        current_Peroid: null //当前投注期号 程序运行时初始化
    };
    //投注方案
    public static investPlan: any = {
        one: {
            investNumbers: ''
        },
        two: {
            investNumbers: ''
        },
        three: {
            investNumbers: ''
        },
        four: {
            investNumbers: ''
        }
    };
}

