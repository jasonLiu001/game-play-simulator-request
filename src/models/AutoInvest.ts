import {AwardMode} from "./AwardMode";
/**
 *
 * @summary 自动投注模型
 * */
export class AutoInvest {
    chongQiUrl: string;//重庆的url地址
    ele_chongQiTab: string;//重庆时时彩Tab元素
    ele_btnHouSan: string;//后三Tab元素
    ele_btnHouSanZhiXuan: string; //后三直选单式
    ele_textSelectedHouSanNumber: string;//后三直选选择号码输入框
    ele_textMoneyDoubleCount: string;//投注倍数
    ele_awardModel: string; //投注的奖金模式
    awardMode: AwardMode; //投注的奖金模式
    ele_btnQuickBuy: string;//直接投注按钮
    ele_divConfirmLayer: string;//投注确认弹层
    ele_btnBuyConfirm: string;//确认投注按钮【可留空】
}