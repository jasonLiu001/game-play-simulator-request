let BrokenGroupService = require('../../../dist/services/rules/BrokenGroup').BrokenGroup;
let Config = require('../../../dist/config/Config').Config;

describe("BrokenGroup Test", () => {
    let brokenGroupService;

    beforeEach(() => {
        brokenGroupService = new BrokenGroupService()
    });

    it("getNumbersNotInGroup test", () => {
        let numbersArray = brokenGroupService.getNumbersNotInGroup('9-456-2378');

        expect(numbersArray).toEqual([0, 1]);
    });

    it("getArray test", () => {
        let numberArray = brokenGroupService.getArray([0, 1]);

        expect(numberArray).toContain('000');
        expect(numberArray).toContain('001');
        expect(numberArray).toContain('111');
    });

    it("getAvailableNumbers test", () => {
        let originalNumbers = ['000', '034', '657', '909', '246', '135', '409', '498', '339', '112'];
        let excludeArray = ['246', '112', '135'];
        let availableNumbers = brokenGroupService.getAvailableNumbers(originalNumbers, excludeArray);

        expect(availableNumbers).not.toContain('246');
        expect(availableNumbers).not.toContain('135');
        expect(availableNumbers).not.toContain('112');
        expect(availableNumbers.length).toEqual(originalNumbers.length - excludeArray.length);
    });

    it("getBrokenGroupNumberArray test", () => {
        let brokenArray = brokenGroupService.getBrokenGroupNumberArray('9-456-2378', 3);

        expect(brokenArray.length).toEqual(72);
        expect(brokenArray).toContain('869');
    });

    it("filterNumbers test", () => {
        Config.globalVariable.last_PrizeNumber = '78904';
        let resultArray = brokenGroupService.filterNumbers(null);

        expect(resultArray).not.toContain('831');
        expect(resultArray).not.toContain('947');
    });
});