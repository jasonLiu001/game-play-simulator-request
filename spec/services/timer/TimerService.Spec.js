let TimeService = require('../../../dist/services/time/TimeService').TimeService;
describe("TimeService Test", () => {
    let timerService;

    beforeEach(() => {
        timerService = new TimeService();
    });

    it("getCurrentPeriodNumber TEST", () => {
        let date = new Date(2017, 10, 25, 23, 58, 0);
        //调用这个方法不能传延迟参数
        let currentPeriod = TimeService.getCurrentPeriodNumber(date,60000);

        expect(currentPeriod).toEqual('20170802-036');
    });
});