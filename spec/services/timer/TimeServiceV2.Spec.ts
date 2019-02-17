import "jasmine";
import moment  = require('moment');
import {TimeServiceV2} from "../../../src/services/time/TimeServiceV2";

describe('TimerServiceV2 test', () => {

    beforeEach((done) => {
        done();
    });

    it('getPeriodList -- 获取所有的期号列表', (done) => {
        let testDate: any = moment('2019-01-12 00:00:00').toDate();
        let periodList: Array<any> = TimeServiceV2.getPeriodList(testDate);
        done();
    }, 60000);

    it('getPeriodList should be work', (done) => {
        let lastPeriodStr: string = TimeServiceV2.getLastPeriodNumber(new Date());
        done();
    }, 60000);
});
