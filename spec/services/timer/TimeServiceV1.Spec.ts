import "jasmine";
import moment  = require('moment');
import {TimeServiceV1} from "../../../src/services/time/TimeServiceV1";

describe('TimerServiceV1 test', () => {

    beforeEach((done) => {
        done();
    });

    it('getPeriodList should be work', (done) => {
        let testDate: any = moment('2019-01-12 00:00:00').toDate();
        let periodList: Array<any> = TimeServiceV1.getPeriodList(testDate);
        done();
    }, 60000);

    it('getPeriodList should be work', (done) => {
        let lastPeriodStr: string = TimeServiceV1.getLastPeriodNumber(new Date());
        done();
    }, 60000);
});
