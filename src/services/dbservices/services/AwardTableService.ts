import {AwardInfo} from "../../../models/db/AwardInfo";
import {AwardTable} from "../tables/AwardTable";
import Promise = require('bluebird');

export class AwardTableService {
    /**
     *
     * 获取开奖信息
     */
    static getAwardInfo(period: string): Promise<AwardInfo> {
        return AwardTable.findOne(
            {
                where: {period: period},
                raw: true
            });
    }

    /**
     * 保存或更新开奖数据
     * @param award
     */
    static saveOrUpdateAwardInfo(award: AwardInfo): Promise<AwardInfo> {
        return AwardTable.findOne(
            {
                where: {period: award.period},
                raw: true
            })
            .then((res) => {
                if (res) {
                    return AwardTable.update(award,
                        {
                            where: {period: award.period}
                        })
                        .then(() => {
                            return award;
                        });
                } else {
                    return AwardTable.create(award)
                        .then((model) => {
                            return model.get({plain: true});
                        });
                }
            });
    }

    /**
     *
     * 批量保存/更新开奖号码
     */
    static saveOrUpdateAwardInfoList(awardList: Array<AwardInfo>): Promise<any> {
        let promiseArray: Array<Promise<any>> = [];
        for (let award of awardList) {
            promiseArray.push(AwardTableService.saveOrUpdateAwardInfo(award));
        }
        return Promise.all(promiseArray);
    }

    /**
     *
     * 获取特定数量的最新开奖数据
     * SELECT rowid AS id, * FROM award ORDER BY period DESC LIMIT 4
     * @param historyCount 获取历史开奖号码按期号倒序排列 最新的是第一条
     */
    static getAwardInfoHistory(historyCount: number) {
        return AwardTable.findAll({
            limit: historyCount,
            order: [
                ['period', 'DESC']
            ],
            raw: true
        });
    }
}