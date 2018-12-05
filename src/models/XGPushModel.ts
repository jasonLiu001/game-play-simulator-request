/**
 *
 * 信鸽push接口实体
 */
export class XGPushModel {
    access_id: number;
    timestamp: number;
    device_token: string;
    message_type: number;
    message: string;
    sign: string;
}
