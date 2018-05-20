let EmailSender = require('../../../dist/services/email/EmailSender').EmailSender;

describe("EamilSender Test", () => {
    beforeEach((done) => {
        done();
    });

    it('should send email success', function (done) {
        EmailSender.sendEmail('测试', '<b>Hello</b>')
            .then((res) => {
                console.log(res);
                done();
            })
            .catch((error) => {
                console.log(error);
                done();
            });
    }, 2000000);

});