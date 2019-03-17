import "jasmine";
import {LotteryDbService} from "../../../src/services/dbservices/ORMService";
import {InvestTableService} from "../../../src/services/dbservices/services/InvestTableService";
import {EnumDbTableName} from "../../../src/models/EnumModel";

describe('ORMService Test', () => {
    beforeEach((done) => {
        done();
    });

    it('getInvestInfoListByStatus Test', (done) => {
        InvestTableService.getInvestInfoListStatusByTableName(EnumDbTableName.INVEST, 0)
            .then((res) => {
                console.log(res);
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
