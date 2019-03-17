/**
 *
 * 一般杀号结果
 */
export class CommonKillNumberResult {
    /**
     *
     * 杀号号码
     */
    killNumber: string;

    /**
     *
     * 杀号结果
     */
    killNumberResult: Array<string>;
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
    baiWei: CommonKillNumberResult;

    /**
     *
     * 杀十位
     */
    shiWei: CommonKillNumberResult;

    /**
     *
     * 杀个位
     */
    geWei: CommonKillNumberResult;

    /**
     *
     * 最终杀号结果
     */
    finalResult: CommonKillNumberResult;
}