/**
 *
 * 投注计划基类
 */
export class PlanInfoBase<T> {
    /**
     *
     * 期号
     * @type {string}
     */
    public period: string;

    /**
     *
     * 杀奇偶类型
     * @type {string}
     */
    public jiOuType: T;

    /**
     *
     * 杀百位
     * @type {string}
     */
    public baiWei: T;

    /**
     *
     *
     * 杀十位
     * @type {string}
     */
    public shiWei: T;

    /**
     *
     *
     * 杀个位
     * @type {string}
     */
    public geWei: T;
}