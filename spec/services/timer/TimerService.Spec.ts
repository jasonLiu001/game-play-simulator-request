import "jasmine";
import moment  = require('moment');
import {TimeService} from "../../../src/services/time/TimeService";

describe('TimerService test', () => {

    beforeEach((done) => {
        done();
    });

    it('getPeriodList should be work', (done) => {
        let testDate: any = moment('2019-01-12 00:00:00').toDate();
        let periodList: Array<any> = TimeService.getPeriodList(testDate);
        done();
    }, 60000);

    it('getPeriodList should be work', (done) => {
        let lastPeriodStr: string = TimeService.getLastPeriodNumber(new Date());
        done();
    }, 60000);
});
