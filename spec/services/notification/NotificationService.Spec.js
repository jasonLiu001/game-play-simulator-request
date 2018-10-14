let NotificationService = require('../../../dist/services/notification/NotificationService').NotificationService;

describe("NotificationService Test", () => {
    let notificationService;

    beforeEach((done) => {
        notificationService = new NotificationService();
        done();
    });


    it("WhenYesterdayAccountBalanceLowerThan test", (done) => {
        notificationService.WhenYesterdayAccountBalanceLowerThan()
            .then((result) => {
                if (result) console.log(result);
                done();
            });
    }, 60000);
});