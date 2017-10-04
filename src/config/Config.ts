import {CaptchaDecoderInfo} from "../models/CaptchaDecoderInfo";
import {AwardMode} from "../models/AwardMode";
import {Login} from "../models/Login";
import {AutoInvest} from "../models/AutoInvest";
import {GlobalVariable} from "../models/GlobalVariable";
import {PlayMode} from "../models/PlayMode";
let path = require('path');

/**
 *
 * 网站URL 地址
 */
export const SITE_URL: string = 'https://123.jn707.com';
/**
 *
 * 常量
 */
export const CONFIG_CONST = {
    //登录用户名
    username: '',
    //登录密码
    password: '',
    //系统设置 是否显示浏览器窗口
    isShowBrowser: false,
    //开奖延迟时间，单位为秒
    openTimeDelaySeconds: 60,
    //自动检查定时器 时间间隔 单位为毫秒ms
    autoCheckTimerInterval: 20000,
    //三星奖金
    awardPrice: 1954,
    //需要获取的历史号码数量
    historyCount: 3,
    //目标盈利金额 单位为元 该值的设置 必须加上初始的账号余额才行 比如：初始100，盈利20，改值为120
    maxWinMoney: 115
};

/**
 *
 * @summary 配置文件
 * */
export class Config {
    //投注的奖金模式
    public static awardModel: AwardMode = {
        yuan: 1,
        jiao: 10,
        feng: 100,
        li: 1000
    };
    //数据库文件路径
    public static dbPath: string = path.resolve(__dirname, "..", "data.db");
    //保存的验证码图片本地路径
    public static captchaImgSavePath: string = path.resolve(__dirname, "..", "captcha.jpeg");
    //正式需要投注的号码
    public static currentInvestNumbers: string = '';
    //当前已经实际投注的期数
    public static currentInvestTotalCount: number = 0;
    //当期选择的奖金模式
    public static currentSelectedAwardMode: number = Config.awardModel.feng;
    //开奖号更新计时器
    public static awardTimer: any = null;
    //投注重试计时器
    public static investRetryTimer: any = null;
    //投注重试计数器
    public static investRetryCount: number = 0;
    //超级鹰验证码解密参数
    public captchaDecorder: CaptchaDecoderInfo = {
        user: CONFIG_CONST.username,
        pass: CONFIG_CONST.password,
        softid: '893450',
        codetype: '1902',
        userfile: Config.captchaImgSavePath
    };
    //全局变量
    public globalVariable: GlobalVariable = {
        last_Period: null, //上期期号 程序运行时初始化
        last_PrizeNumber: null, //上期开奖号码 程序运行时初始化
        nextPeriodInvestTime: null, //下期投注时间 程序运行时初始化
        current_Peroid: null, //当前投注期号 程序运行时初始化
        currentAccoutBalance: 100//当前账户余额 程序运行时初始化
    };

    //UI网站登录参数
    public loginModel: Login = {
        ele_username: "#username",
        ele_password: "#password",
        ele_captchaCode: "#validate",
        ele_waitComplete: "#content",//点击登录按钮后，判断页面是否加载完成的元素
        btnLogin: "#login",
        username: CONFIG_CONST.username,
        password: CONFIG_CONST.password
    };
    //UI自动投注模型
    public autoInvestModel: AutoInvest = {
        chongQiUrl: SITE_URL + "/game?1",
        ele_chongQiTab: "#navul > ul > li.pr.submenu-box.active > div > div:nth-child(1) > ul > li.n_1",
        ele_btnHouSan: "#MainContent > div.rema.betMenu > div:nth-child(3) > a",
        ele_btnHouSanZhiXuan: "#MainContent > div.conbox03 > div > div:nth-child(3) > div:nth-child(1) > a:nth-child(3)",
        ele_textSelectedHouSanNumber: "#bet_text",
        ele_textMoneyDoubleCount: "#_game_bmultiple",
        ele_awardModel: "#game-unit",
        awardMode: Config.awardModel,
        ele_btnQuickBuy: "#mashangtouzhu > a",
        ele_divConfirmLayer: "#layui-layer3",
        ele_btnBuyConfirm: "#layui-layer3 > div.layui-layer-btn.layui-layer-btn- > a"
    };
    //UI上期开奖号码
    public ele_lastPrizeNumber = {
        wang: '#bet-history > ul:nth-child(1) > li:nth-child(2) > div:nth-child(1)',//奖号万位
        qian: '#bet-history > ul:nth-child(1) > li:nth-child(2) > div:nth-child(2)',//奖号千位
        bai: '#bet-history > ul:nth-child(1) > li:nth-child(2) > div:nth-child(3)',//奖号百位
        shi: '#bet-history > ul:nth-child(1) > li:nth-child(2) > div:nth-child(4)',//奖号十位
        ge: '#bet-history > ul:nth-child(1) > li:nth-child(2) > div:nth-child(5)'//奖号个位
    };
    //UI当期投注期号元素
    public ele_divPrizePeriodNumber: string = "#_game_issueno";
    //UI上期开奖期号元素
    public ele_divLastPrizePeriodNumber: string = "#_gameissue_ago";
    //UI账号当前剩余金额
    public ele_currentAccountBalance: string = "body > div.top > div.head-a > div > ul > li.show-money > a > span";
    //UI刷新当前账号余额按钮
    public ele_btnRefreshMoneyAccount: string = "body > div.top > div.head-a > div > ul > li.show-money > a > i";

    //玩法类型
    public playMode: PlayMode = {
        three: 'three',//三星
        two: 'two',//二星
        one: 'one'//一星
    };
    //当前玩法类型
    public currentSelectedPlayMode: string = this.playMode.three;

    /**
     *
     * Promise的reject的消息字符
     */
    public rejectionMsg = {
        isExistRecordInAward: 'exist-record-in-award',
        notReachInvestTime: 'not-reach-invest-time',//未达到下期的投注时间
        lastPrizeNumberNotUpdated: 'not-update-last-prize-number',//上期开奖号码未更新
        canExecuteRealInvest: 'not-allow-execute-invest',//不允许投注
        navigationError: 'navigation error',//打开页面错误
        historyCountIsNotEnough: 'history-count-in-award-table-is-not-enough'//开奖号码中的历史数据不够
    };

    /**
     *
     *
     * 模拟的http请求头
     */
    public static readonly httpRequestHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.104 Safari/537.36 Core/1.53.3103.400 QQBrowser/9.6.11372.400',
        'Accept': '*/*'
    };
}

