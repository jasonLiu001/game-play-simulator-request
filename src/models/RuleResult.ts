/**
 *
 * 一般杀号结果
 */
export class CommonKillNumberResult {
    /**
     *
     * 杀号号码
     */
    public killNumber: string;

    /**
     *
     * 杀号结果
     */
    public killNumberResult: Array<string>;
}


/**
 *
 * 定位杀号
 */
export class FixedPositionKillNumberResult {
    /**
     *
     * 杀百位
     */
    public baiWei: CommonKillNumberResult;

    /**
     *
     * 杀十位
     */
    public shiWei: CommonKillNumberResult;

    /**
     *
     * 杀个位
     */
    public geWei: CommonKillNumberResult;

    /**
     *
     * 最终杀号结果
     */
    public finalResult: CommonKillNumberResult;
}