import Promise = require('bluebird');
import {EnumVendorType} from "../../../models/EnumModel";
import {VendorTable} from "../tables/VendorTable";
import {VendorInfo} from "../../../models/db/VendorInfo";

export class VendorTableService {
    /**
     *
     * 获取所有厂商信息
     */
    static getVendorInfoList(): Promise<Array<VendorInfo>> {
        return VendorTable.findAll({
            order: [
                ['orderId', 'ASC']
            ],
            raw: true
        })
    }

    /**
     *
     * 获取厂商信息
     * @param enumVendorType 枚举值 包括 腾讯短信服务(TencentSMS)
     */
    static getVendorInfo(enumVendorType: EnumVendorType): Promise<VendorInfo> {
        return VendorTable.findOne({
            where: {type: enumVendorType},
            raw: true
        });
    }

    /**
     *
     * 保存或者更新厂商信息
     */
    static saveOrUpdateVendorInfo(vendorInfo: VendorInfo): Promise<VendorInfo> {
        return VendorTable.findOne(
            {
                where: {key: vendorInfo.key},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return VendorTable.update(vendorInfo,
                        {
                            fields: ['value'],
                            where: {
                                key: vendorInfo.key
                            }
                        })
                        .then(() => {
                            return vendorInfo;
                        });
                } else {
                    return VendorTable.create(vendorInfo)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }
}