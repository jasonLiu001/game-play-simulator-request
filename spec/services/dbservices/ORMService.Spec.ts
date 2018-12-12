import "jasmine";
import {LotteryDbService} from "../../../src/services/dbservices/ORMService";

describe('ORMService Test', () => {
    beforeEach((done) => {
        done();
    });

    it('getInvestInfoListByStatus Test', (done) => {
        LotteryDbService.getInvestInfoListByStatus(0)
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
