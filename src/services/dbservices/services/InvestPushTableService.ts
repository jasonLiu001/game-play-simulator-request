import Promise = require('bluebird');
import {InvestPush} from "../tables/InvestPushTable";
import {InvestPushInfo} from "../../../models/db/InvestPushInfo";

export class InvestPushTableService{
    public static saveOrUpdateInvestPushInfo(investPush: InvestPushInfo): Promise<InvestPushInfo> {
        return InvestPush.findOne(
            {
                where: {
                    deviceToken: investPush.deviceToken,
                    pushPlatform: investPush.pushPlatform
                },
                raw: true
            })
            .then((res) => {
                if (res) {
                    return InvestPush.update(investPush,
                        {
                            where: {
                                deviceToken: investPush.deviceToken,
                                pushPlatform: investPush.pushPlatform
                            },
                        })
                        .then(() => {
                            return investPush;
                        });
                } else {
                    return InvestPush.create(investPush)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存推送信息
     */
    public static saveOrUpdateInvestPushInfoList(investPushList: Array<InvestPushInfo>): Promise<Array<InvestPushInfo>> {
        let promiseArray: Array<Promise<any>> = [];
        for (let investPush of investPushList) {
            promiseArray.push(InvestPushTableService.saveOrUpdateInvestPushInfo(investPush));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量历史记录
     * @param {number} historyCount
     * @param pushPlatform push厂商平台 参见枚举类EnumPushPlatformType
     * @param pushVendorType push厂商枚举 参见枚举类EnumPushVendorType
     */
    public static getInvestPushInfoHistory(historyCount: number, pushPlatform: number, pushVendorType: string): Promise<Array<any>> {
        return InvestPush.findAll({
            limit: historyCount,
            order: [
                ['createdTime', 'DESC']
            ],
            where: {
                pushPlatform: pushPlatform,
                pushVendorType: pushVendorType
            },
            raw: true
        });
    }
}