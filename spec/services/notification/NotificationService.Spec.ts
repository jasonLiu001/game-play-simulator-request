import "jasmine";
import {NotificationService} from "../../../src/services/notification/NotificationService";
import {CONFIG_CONST} from "../../../src/config/Config";
import {EnumDbTableName} from "../../../src/models/EnumModel";

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
        notificationService.sendContinueWinOrLoseWarnEmail(EnumDbTableName.INVEST_TOTAL, CONFIG_CONST.currentSelectedInvestPlanType, 2, false)
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
