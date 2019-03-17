/**
 *
 * 投注计划基类 Model实体属性
 */
export class PlanInfoBase<T> {
    /**
     *
     * 期号
     * @type {string}
     */
    period: string;

    /**
     *
     * 杀奇偶类型
     * @type {string}
     */
    jiou_type: T;

    /**
     *
     *杀号计划 杀百位
     * @type {string}
     */
    killplan_bai_wei: T;

    /**
     *
     *
     *杀号计划 杀十位
     * @type {string}
     */
    killplan_shi_wei: T;

    /**
     *
     *
     *杀号计划 杀个位
     * @type {string}
     */
    killplan_ge_wei: T;

    /**
     *
     * 遗漏计划 杀百位
     */
    missplan_bai_wei: T;

    /**
     *
     * 遗漏计划 杀十位
     */
    missplan_shi_wei: T;

    /**
     *
     * 遗漏计划 杀个位
     */
    missplan_ge_wei: T;

    /**
     *
     * 断组 3-3-4
     */
    brokengroup_01_334: T;

    /**
     *
     *
     * 断组 2-2-4 断组
     */
    brokengroup_01_224: T;

    /**
     *
     *
     * 断组 1-2-5 断组
     */
    brokengroup_01_125: T;

    /**
     *
     * 杀012路类型
     */
    road012_01: T;

    /**
     *
     * 杀跨度
     */
    number_distance: T;

    /**
     *
     * 杀和值
     */
    sum_values: T;

    /**
     *
     * 特殊号：三连
     */
    three_number_together: T;

    /**
     *
     * 杀百位
     * @type {string}
     */
    killbaiwei_01: T;

    /**
     *
     * 杀十位
     * @type {string}
     */
    killshiwei_01: T;

    /**
     *
     *
     * 杀个位
     * @type {string}
     */
    killgewei_01: T;

    /**
     *
     * 6胆
     */
    bravenumber_6_01: T;

    /**
     *
     * 当前数据是否已经更新
     */
    status: number;
}