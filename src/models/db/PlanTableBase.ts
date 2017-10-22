/**
 *
 *
 * 计划详情枚举基类表
 */
export class PlanTableBase {

    /**
     *
     * 期号
     * @type {string}
     */
    public static period: string = "period";

    /**
     *
     * 杀奇偶类型
     * @type {string}
     */
    public static jiOuType: string = "jiou_type";

    /**
     *
     * 杀百位
     * @type {string}
     */
    public static baiWei: string = "killplan_bai_wei";

    /**
     *
     *
     * 杀十位
     * @type {string}
     */
    public static shiWei: string = "killplan_shi_wei";

    /**
     *
     *
     * 杀个位
     * @type {string}
     */
    public static geWei: string = "killplan_ge_wei";

    /**
     *
     * 是否已经更新
     * @type {string}
     */
    public static status: string = "status";
}