import "jasmine";
import moment  = require('moment');
import {PlatformService} from "../src/services/platform/PlatformService";
import {GlobalRequest} from "../src/global/GlobalRequest";

describe('cancelInvest test', () => {
    beforeEach((done) => {
        done();
    });

    xit('cancelInvest should be work', (done) => {
        PlatformService.cancelInvest(GlobalRequest.request, '20181202-042')
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

    it('moment test', () => {
        console.log(moment('20181221').subtract(1, 'days').format("YYYY-MM-DD"));
    })
});
