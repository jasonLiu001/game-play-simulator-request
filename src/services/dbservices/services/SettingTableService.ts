import Promise = require('bluebird');
import {SettingsInfo, UpdateSettingsInfo} from "../../../models/db/SettingsInfo";
import {SettingTable} from "../tables/SettingTable";

export class SettingTableService{
    /**
     *
     * 获取所有的参数设置信息
     */
    public static getSettingsInfoList(): Promise<Array<SettingsInfo>> {
        return SettingTable.findAll({
            order: [
                ['orderId', 'ASC']
            ],
            raw: true
        });
    }

    /**
     *
     * 保存或更新设置
     */
    public static saveOrUpdateSettingsInfo(settingsInfo: UpdateSettingsInfo): Promise<SettingsInfo> {
        return SettingTable.findOne(
            {
                where: {key: settingsInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return SettingTable.update(settingsInfo,
                        {
                            fields: ['value'],
                            where: {
                                key: settingsInfo.key
                            }
                        })
                        .then(() => {
                            return settingsInfo;
                        });
                } else {
                    return SettingTable.create(settingsInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }
}