let ThreeNumberTogether = require('../../../dist/services/rules/ThreeNumberTogether').ThreeNumberTogether;

describe("ThreeNumberTogether Test", () => {
    let threeNumberTogether;
    beforeEach((done) => {
        threeNumberTogether = new ThreeNumberTogether();
        done();
    });

    it("filterNumbers test", (done) => {
        threeNumberTogether.filterNumbers()
            .then((result) => {
                expect(result.killNumberResult).not.toContain('345');
                expect(result.killNumberResult).not.toContain('354');
                expect(result.killNumberResult).not.toContain('435');
                expect(result.killNumberResult).not.toContain('453');
                expect(result.killNumberResult).not.toContain('534');
                expect(result.killNumberResult).not.toContain('543');
                expect(result.killNumberResult).not.toContain('019');
                expect(result.killNumberResult).not.toContain('908');
                expect(result.killNumberResult).toContain('010');
                expect(result.killNumberResult).toContain('343');
                done();
            });
    });
});