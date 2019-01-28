import "jasmine";
import moment  = require('moment');
import {DoubleInvestService} from "../../../src/services/invest/DoubleInvestService";
import {GlobalRequest} from "../../../src/global/GlobalRequest";

describe('DoubleInvestService test', () => {
    let doubleInvestService;

    beforeEach((done) => {
        doubleInvestService = new DoubleInvestService();
        done();
    });

    it('executeDoubleInvestService should be work', (done) => {
        doubleInvestService.executeDoubleInvestService(GlobalRequest.request)
            .then(() => {
                done();
            })
            .catch((e) => {
                console.log(e);
                done();
            });
    }, 60000);

    xit('moment test', () => {
        console.log(moment('20181221').subtract(1, 'days').format("YYYY-MM-DD"));
    })
});
