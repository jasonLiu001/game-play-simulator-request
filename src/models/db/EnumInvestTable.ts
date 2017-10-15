/**
 *
 *
 * 投注记录表
 */
export const enum EnumInvestTable {
    /**
     *
     *
     * 数据表名称
     * @type {string}
     */
    tableName = "invest",

        /**
         *
         *
         * 期号
         * @type {string}
         */
    period = "period",

        /**
         *
         *
         * 投注号码
         * @type {string}
         */
    investNumbers = "investNumbers",

        /**
         *
         * 投注号码总注数
         * @type {string}
         */
    investNumberCount = "investNumberCount",

        /**
         *
         *
         * 当前账户余额
         * @type {string}
         */
    currentAccountBalance = "currentAccountBalance",

        /**
         *
         * 元、角、分、厘 模式
         * @type {string}
         */
    awardMode = "awardMode",

        /**
         *
         *
         * 盈利金额
         * @type {string}
         */
    winMoney = "winMoney",

        /**
         *
         *
         * 是否开奖标识
         * @type {string}
         */
    status = "status",

        /**
         *
         *
         * 是否中奖标识
         * @type {string}
         */
    isWin = "isWin",

        /**
         *
         * 投注时间
         * @type {string}
         */
    investTime = "investTime"
}