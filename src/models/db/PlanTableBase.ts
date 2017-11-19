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
     * 杀跨度
     */
    public static numberDistance: string = "number_distance";

    /**
     *
     * 杀和值
     */
    public static sumValues: string = "sum_values";

    /**
     *
     * 特殊号：三连
     */
    public static threeNumberTogether: string = "three_number_together";

    /**
     *
     * 杀百位
     * @type {string}
     */
    public static killBaiWei_01: string = "killbaiwei_01";

    /**
     *
     * 杀十位
     * @type {string}
     */
    public static killShiWei_01: string = "killshiwei_01";

    /**
     *
     *
     * 杀个位
     * @type {string}
     */
    public static killGeWei_01: string = "killgewei_01";

    /**
     *
     * 6胆
     * @type {string}
     */
    public static braveNumber_6_01: string = "bravenumber_6_01";

    /**
     *
     * 是否已经更新
     * @type {string}
     */
    public static status: string = "status";
}