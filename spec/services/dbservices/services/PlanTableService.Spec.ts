import "jasmine";
import {PlanTableService} from "../../../../src/services/dbservices/services/PlanTableService";

describe('PlanTableService Test', () => {
    beforeEach((done) => {
        done();
    });

    it('getInvestInfoListByStatus Test', (done) => {
        PlanTableService.getPlanResultInfoListByStatus(0)
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
