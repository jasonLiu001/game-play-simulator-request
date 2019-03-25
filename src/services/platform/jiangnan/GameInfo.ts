/**
 *
 * 江南平台 POST https://123.jn716.com/gameType/initGame.mvc?gameID=1
 */
export class GameInfo {
    /**
     *
     * 需要的token值
     */
    token_tz: string;
    /**
     *
     * 开奖历史
     */
    history: Array<GameHistory>;
}

export class GameHistory {
    gametype: number;
    /**
     *
     * 期号
     */
    issueno: string;
    /**
     *
     * 奖号
     */
    nums: string;
}
