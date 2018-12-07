/**
 *
 * 发送push相关信息
 */
export class InvestPushInfo {
    /**
     *
     * 发送push的device token
     */
    deviceToken: string;

    /**
     *
     * 设备号
     */
    imei: string;

    /**
     *
     * 发送push的平台
     */
    pushPlatform: number;

    /**
     *
     * token过期时间
     */
    tokenExpireTime: string;

    /**
     *
     * 记录创建时间
     */
    createdTime: string;

    /**
     *
     * push厂商类型
     */
    pushVendorType: string;
}
