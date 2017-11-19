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
     *杀号计划 杀百位
     * @type {string}
     */
    public killplan_bai_wei: T;

    /**
     *
     *
     *杀号计划 杀十位
     * @type {string}
     */
    public killplan_shi_wei: T;

    /**
     *
     *
     *杀号计划 杀个位
     * @type {string}
     */
    public killplan_ge_wei: T;

    /**
     *
     * 遗漏计划 杀百位
     */
    public missplan_bai_wei: T;

    /**
     *
     * 遗漏计划 杀十位
     */
    public missplan_shi_wei: T;

    /**
     *
     * 遗漏计划 杀个位
     */
    public missplan_ge_wei: T;

    /**
     *
     * 断组 3-3-4
     */
    public brokengroup_01_334: T;

    /**
     *
     *
     * 断组 2-2-4 断组
     */
    public brokengroup_01_224: T;

    /**
     *
     *
     * 断组 1-2-5 断组
     */
    public brokengroup_01_125: T;

    /**
     *
     * 杀012路类型
     */
    public road012_01: T;

    /**
     *
     * 杀跨度
     */
    public number_distance: T;

    /**
     *
     * 杀和值
     */
    public sum_values: T;

    /**
     *
     * 特殊号：三连
     */
    public three_number_together: T;

    /**
     *
     * 当前数据是否已经更新
     */
    public status: number;
}