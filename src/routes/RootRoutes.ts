import * as express from 'express';

/**
 *
 * "/" 根路径路由
 */
class RootRoutes {
    public router: express.Router;

    constructor() {
        this.router = express.Router();

        /* GET home page. */
        this.router.get('/', function (req, res, next) {
            res.render('index', {title: 'Express'});
        });
    }
}

export default new RootRoutes().router;
