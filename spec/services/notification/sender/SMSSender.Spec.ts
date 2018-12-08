import "jasmine";
import {SMSSender} from "../../../../src/services/notification/sender/SMSSender";
import {EnumSMSSignType, EnumSMSTemplateType} from "../../../../src/models/EnumModel";
import {CONFIG_CONST} from "../../../../src/config/Config";

describe('invest method test', () => {
    beforeEach((done) => {
        done();
    });

    it('send method should be work', (done) => {
        SMSSender.send("20181207-038", "12:12:00", String(CONFIG_CONST.currentSelectedInvestPlanType), EnumSMSSignType.cnlands, EnumSMSTemplateType.RECOMMEND_INVEST)
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                }
                done();
            })
    }, 60000);
});
