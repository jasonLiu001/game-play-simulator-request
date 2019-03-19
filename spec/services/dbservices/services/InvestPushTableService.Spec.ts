import "jasmine";
import {InvestPushTableService} from "../../../../src/services/dbservices/services/InvestPushTableService";


describe('InvestPushTableService Test', () => {
    beforeEach((done) => {
        done();
    });

    it('getInvestPushInfoHistory Test', (done) => {
        InvestPushTableService.getInvestPushInfoHistory(100, 1, 'TENCENT_XG')
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
