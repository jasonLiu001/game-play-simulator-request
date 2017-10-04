let AbstractRuleBase = require('../../../dist/services/rules/AbstractRuleBase').AbstractRuleBase;
describe("AbstractRuleBase Test", () => {
    let abstractRuleBase;

    beforeEach(() => {
        abstractRuleBase = new AbstractRuleBase();
    });

    it("getRestKillNumberArray test", () => {
        let totalArray = abstractRuleBase.getTotalNumberArray();
        let result = abstractRuleBase.getRestKillNumberArray(null, totalArray, [5], [5], [5]);
        let str = result.join(',');
        expect(result).toBeDefined();
    });
});
