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
    public jiou_type: T;

    /**
     *
     * 杀百位
     * @type {string}
     */
    public killplan_bai_wei: T;

    /**
     *
     *
     * 杀十位
     * @type {string}
     */
    public killplan_shi_wei: T;

    /**
     *
     *
     * 杀个位
     * @type {string}
     */
    public killplan_ge_wei: T;

    /**
     *
     * 当前数据是否已经更新
     */
    public status: number;
}