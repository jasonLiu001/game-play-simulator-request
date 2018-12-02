import "jasmine";
import {DefaultRequest} from "../src/services/AppServices";
import {PlatformService} from "../src/services/platform/PlatformService";

describe('cancelInvest test', () => {
    beforeEach((done) => {
        done();
    });

    it('cancelInvest should be work', (done) => {
        PlatformService.cancelInvest(DefaultRequest.request, '20181202-042')
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