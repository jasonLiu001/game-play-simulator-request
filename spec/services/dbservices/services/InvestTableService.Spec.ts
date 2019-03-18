import "jasmine";
import {InvestTableService} from "../../../../src/services/dbservices/services/InvestTableService";
import {EnumDbTableName} from "../../../../src/models/EnumModel";
import {InvestInfo} from "../../../../src/models/db/InvestInfo";
import {ProfitQuery} from "../../../../src/models/query/ProfitQuery";


describe('InvestTableService Test', () => {
    beforeEach((done) => {
        done();
    });

    it('getInvestInfoListStatusByTableName Test', (done) => {
        InvestTableService.getInvestInfoListStatusByTableName(EnumDbTableName.INVEST, 0)
            .then((resultList) => {
                for (let item of resultList) {
                    console.dir(item);
                    let investInfo: InvestInfo = {
                        period: item.period,
                        planType: item.planType,
                        investNumbers: item.investNumbers,
                        currentAccountBalance: item.currentAccountBalance,
                        originAccountBalance: item.originAccountBalance,
                        investNumberCount: item.investNumberCount,
                        awardMode: item.awardMode,
                        touZhuBeiShu: item.touZhuBeiShu,
                        isUseReverseInvestNumbers: item.isUseReverseInvestNumbers,
                        winMoney: item.winMoney,
                        status: item.status,
                        isWin: item.isWin,
                        investTime: item.investTime,
                        investDate: item.investDate,
                        investTimestamp: item.investTimestamp
                    };
                    console.log("item openNumber=" + item.openNumber);
                    //后三开奖号码
                    let prizeNumber = item.openNumber.substring(2);
                    console.log("prizeNumber=" + prizeNumber);
                }
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            });
    }, 60000);

    xit('getInvestProfitListByTableName Test', (done) => {
        let profitQuery: ProfitQuery = new ProfitQuery();
        profitQuery.tableName = EnumDbTableName.INVEST;
        profitQuery.pageIndex = 1;
        profitQuery.pageSize = 20;
        profitQuery.planType = 1;
        profitQuery.startTime = "00:00:00";
        profitQuery.endTime = "23:59:59";
        InvestTableService.getInvestProfitListByTableName(profitQuery)
            .then((profitlist) => {
                console.log(profitlist);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            });
    }, 60000);
});
