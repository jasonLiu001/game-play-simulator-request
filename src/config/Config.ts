import {GlobalVariable} from "../models/GlobalVariable";
import {EnumAwardMode} from "../models/EnumModel";
let path = require('path');

/**
 *
 * 常量
 */
export const CONFIG_CONST = {
    //登录网站url
    siteUrl: 'https://123.jn707.com',
    //需要获取的历史号码数量
    historyCount: 3,
    //开奖延迟时间，单位为秒
    openTimeDelaySeconds: 60,
    //自动检查定时器 时间间隔 单位为毫秒ms
    autoCheckTimerInterval: 20000,
    //三星奖金
    awardPrice: 1954,
    //投注倍数
    touZhuBeiShu: '1',
    //登录用户名
    username: '',
    //登录密码
    password: '',
    //元、角、分 模式
    awardMode: EnumAwardMode.feng,//yuan,jiao,feng,li
    //账户初始余额
    currentAccoutBalance: 100,
    //账号最大值 盈利金额设置 单位为元  其中：0.12代表在当前账号余额基础上允许盈利：12%
    maxAccountBalance: this.currentAccoutBalance * (1 + 0.12),
    //账号最小值 亏损金额设置 单位为元  其中：0.45代表在当前账号余额基础上允许亏损：45%
    minAccountBalance: this.currentAccoutBalance * (1 - 0.45)
};

/**
 *
 * @summary 配置文件
 * */
export class Config {
    //数据库文件路径
    public static dbPath: string = path.resolve(__dirname, "..", "data.db");
    //保存的验证码图片本地路径
    public static captchaImgSavePath: string = path.resolve(__dirname, "..", "captcha.jpeg");
    //正式需要投注的号码
    public static currentInvestNumbers: string = '';
    //当前已经实际投注的期数
    public static currentInvestTotalCount: number = 0;
    //当期选择的奖金模式
    public static currentSelectedAwardMode: number = CONFIG_CONST.awardMode;
    //开奖号更新计时器
    public static awardTimer: any = null;
    //全局变量
    public static globalVariable: GlobalVariable = {
        last_Period: null, //上期期号 程序运行时初始化
        last_PrizeNumber: null, //上期开奖号码 程序运行时初始化
        nextPeriodInvestTime: null, //下期投注时间 程序运行时初始化
        current_Peroid: null, //当前投注期号 程序运行时初始化
        currentAccoutBalance: CONFIG_CONST.currentAccoutBalance//当前账户余额 程序运行时初始化
    };
}

