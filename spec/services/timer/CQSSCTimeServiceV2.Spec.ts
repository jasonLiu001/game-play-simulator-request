import "jasmine";
import moment  = require('moment');
import {CQSSCTimeServiceV2} from "../../../src/services/time/CQSSCTimeServiceV2";

describe('TimerServiceV2 test', () => {
    let testDate: any;

    beforeEach((done) => {
        testDate = moment('2019-01-11 23:50:00').toDate();
        done();
    });

    xit('getPeriodList -- 获取所有的期号列表', (done) => {
        let periodList: Array<any> = CQSSCTimeServiceV2.getPeriodList(testDate);
        done();
    }, 60000);

    xit('getOpenTimeList -- 获取所有开时间列表 ', (done) => {
        let openTimelist: Array<any> = CQSSCTimeServiceV2.getOpenTimeList(testDate);
        done();
    }, 60000);

    xit('getNextOpenTime -- 获取下期开奖时间 ', (done) => {
        let nextOpenTime: any = CQSSCTimeServiceV2.getNextOpenTime(testDate);
        done();
    }, 60000);

    xit('getLastPeriodNumber -- 获取上期期号 ', (done) => {
        let lastPeriodNumber: any = CQSSCTimeServiceV2.getLastPeriodNumber(testDate);
        done();
    }, 60000);

    it('getCurrentPeriodNumber -- 获取当前可投注期号 ', (done) => {
        let currentPeriodNumber: any = CQSSCTimeServiceV2.getCurrentPeriodNumber(testDate);
        done();
    }, 60000);

    xit('getCurrentNextPeriodNumber -- 获取下期期号 ', (done) => {
        let currentNextPeriodNumber: any = CQSSCTimeServiceV2.getCurrentNextPeriodNumber(testDate);
        done();
    }, 60000);
});
