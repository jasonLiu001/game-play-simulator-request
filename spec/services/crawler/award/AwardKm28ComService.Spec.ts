import "jasmine";
import {AwardKm28ComService} from "../../../../src/services/crawler/award/AwardKm28ComService";
import {AwardInfo} from "../../../../src/models/db/AwardInfo";

describe('Our awesome test', () => {
    let awardKm28ComService: AwardKm28ComService;

    beforeEach((done) => {
        awardKm28ComService = new AwardKm28ComService();
        done();
    });


    it('getAwardInfo test', (done) => {
        awardKm28ComService.getAwardInfo()
            .then((awardInfo: AwardInfo) => {
                expect(awardInfo).not.toBeNull(awardInfo);
                done();
            })
            .catch((e) => {
                console.log(e);
                done();
            });
    }, 60000);
});
