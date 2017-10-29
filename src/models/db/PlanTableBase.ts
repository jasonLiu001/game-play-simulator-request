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
     * 杀号计划 杀百位
     * @type {string}
     */
    public static killplanBaiWei: string = "killplan_bai_wei";

    /**
     *
     *
     *杀号计划 杀十位
     * @type {string}
     */
    public static killplanShiWei: string = "killplan_shi_wei";

    /**
     *
     *
     *杀号计划 杀个位
     * @type {string}
     */
    public static killplanGeWei: string = "killplan_ge_wei";

    /**
     *
     *
     * 遗漏计划 杀百位
     * @type {string}
     */
    public static missplanBaiWei: string = "missplan_bai_wei";

    /**
     *
     *
     * 遗漏计划 杀十位
     * @type {string}
     */
    public static missplanShiWei: string = "missplan_shi_wei";

    /**
     *
     *
     * 遗漏计划 杀个位
     * @type {string}
     */
    public static missplanGeWei: string = "missplan_ge_wei";


    /**
     *
     *
     * 断组 3-3-4 断组
     * @type {string}
     */
    public static brokenGroup_01_334: string = "brokengroup_01_334";

    /**
     *
     *
     * 断组 2-2-4 断组
     * @type {string}
     */
    public static brokenGroup_01_224: string = "brokengroup_01_224";

    /**
     *
     *
     * 断组 1-2-5 断组
     * @type {string}
     */
    public static brokenGroup_01_125: string = "brokengroup_01_125";


    /**
     *
     *
     * 012路
     * @type {string}
     */
    public static road012_01: string = "road012_01";

    /**
     *
     * 是否已经更新
     * @type {string}
     */
    public static status: string = "status";
}