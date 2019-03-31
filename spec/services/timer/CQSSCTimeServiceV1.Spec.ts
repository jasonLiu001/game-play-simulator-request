import "jasmine";
import moment  = require('moment');
import {CQSSCTimeServiceV1} from "../../../src/services/time/CQSSCTimeServiceV1";

describe('TimerServiceV1 test', () => {

    beforeEach((done) => {
        done();
    });

    it('getPeriodList should be work', (done) => {
        let testDate: any = moment('2019-01-12 00:00:00').toDate();
        let periodList: Array<any> = CQSSCTimeServiceV1.getPeriodList(testDate);
        done();
    }, 60000);
});
