import "jasmine";
import moment  = require('moment');
import {TimeServiceV2} from "../../../src/services/time/TimeServiceV2";

describe('TimerServiceV2 test', () => {
    let testDate: any;

    beforeEach((done) => {
        testDate = moment('2019-01-11 23:50:00').toDate();
        done();
    });

    xit('getPeriodList -- 获取所有的期号列表', (done) => {
        let periodList: Array<any> = TimeServiceV2.getPeriodList(testDate);
        done();
    }, 60000);

    xit('getOpenTimeList -- 获取所有开时间列表 ', (done) => {
        let openTimelist: Array<any> = TimeServiceV2.getOpenTimeList(testDate);
        done();
    }, 60000);

    xit('getNextOpenTime -- 获取下期开奖时间 ', (done) => {
        let nextOpenTime: any = TimeServiceV2.getNextOpenTime(testDate);
        done();
    }, 60000);
});
