let KillNumbersFollowPlay = require('../../../../dist/services/rules/killnumber/KillNumbersFollowPlay').KillNumbersFollowPlay;
describe("KillNumbersFollowPlay Test", () => {
    let killNumberService;

    beforeEach((done) => {
        killNumberService = new KillNumbersFollowPlay();
        done();
    });

    it("getRestKillNumberArray test", () => {
        let totalArray = killNumberService.getTotalNumberArray();

        let result = killNumberService.getRestKillNumberArray(null, totalArray, ['9', '2']);

        expect(result.length).toBe(800);
    });

    it("filterNumbers test", (done) => {
        killNumberService.filterNumbers(null)
            .then((result) => {
                expect(result).toBeDefined();
                done();
            });
    });
});