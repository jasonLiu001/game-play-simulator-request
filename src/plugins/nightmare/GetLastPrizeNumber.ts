/**
 *
 *
 * @summary 扩展nightmare，添加自定义方法
 * */

module.exports = {
    install: (Nightmare) => {
        Nightmare.action('getLastPrizeNumber', function (selector, done) {
            this.evaluate_now((selector) => {

                //TODO:application business logic.

            }, done, selector);
        });
        return Nightmare;
    }
};