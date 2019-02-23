import "jasmine";
import moment  = require('moment');
import {Award500comService} from "../../../../src/services/crawler/historyawards/Award500comService";
import {AwardInfo} from "../../../../src/models/db/AwardInfo";

describe('Award500comService test', () => {
    beforeEach((done) => {
        done();
    });

    it('getHistoryAwardByDate should be work', (done) => {
        Award500comService.getHistoryAwardByDate('2019-02-24')
            .then((awardList) => {
                console.log(awardList);
                done();
            })
            .catch((e) => {
                console.log(e);
                done();
            });
    }, 60000);
});
