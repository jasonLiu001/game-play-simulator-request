import "jasmine";
import {NotificationService} from "../../../src/services/notification/NotificationService";
import {CONST_INVEST_TOTAL_TABLE} from "../../../src/models/db/CONST_INVEST_TOTAL_TABLE";

describe('cancelInvest test', () => {
    let notificationService;

    beforeEach((done) => {
        notificationService = new NotificationService();
        done();
    });

    it("whenYesterdayAccountBalanceLowerThan test", (done) => {
        notificationService.whenYesterdayAccountBalanceLowerThan()
            .then((result) => {
                if (result) console.log(result);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            });
    }, 60000);

    xit('cancelInvest should be work', (done) => {
        notificationService.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TOTAL_TABLE.tableName, 2, false)
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
