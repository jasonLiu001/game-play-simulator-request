import "jasmine";
import {SMSSender} from "../../../../src/services/notification/sender/SMSSender";

describe('cancelInvest test', () => {
    beforeEach((done) => {
        done();
    });

    it('cancelInvest should be work', (done) => {
        SMSSender.send("20181207-038", "12:12:00", "cnlands", 243148)
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            })
    }, 60000);
});
