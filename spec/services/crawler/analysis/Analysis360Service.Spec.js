let Analysis360Service = require('../../../../dist/services/crawler/analysis/Analysis360Service').Analysis360Service;
let Nightmare = require('nightmare');
let path = require('path');
let Promise = require('bluebird');

describe("Analysis360Service Test", () => {
    let analysisService, nightmare;

    beforeEach((done) => {
        analysisService = new Analysis360Service();
        nightmare = Nightmare({
            show: false,
            width: 800,
            heigh: 600,
            alwaysOnTop: false,
            Promise: require('bluebird'),
            webSecurity: false,
            allowRunningInsecureContent: true //允许在https的页面中调用http的资源
        });
        done();
    });

    afterAll(() => {
        nightmare
            .end()
            .then();
    });

    it("nightmare should be defined", (done) => {
        expect(nightmare).toBeDefined();
        done();
    });

    xit("getKillNumber test", (done) => {
        analysisService.getKillNumber(0)
            .then((data) => {
                expect(data).toBe('170715-081');
                done();
            })
            .catch((e) => {
                if (e) console.error(e);
                done();
            });

    }, 60000);

    it("getMaxMissNumber test", (done) => {
        analysisService.getMaxMissNumber(0)
            .then((data) => {
                expect(data).toBe('170715-081');
                done();
            })
            .catch((e) => {
                if (e) console.error(e);
                done();
            });

    }, 60000);

});