import * as express from 'express';
import {AwardController} from "../controller/AwardController";

/**
 *
 * “/api” 路径路由
 */
class ApiRoutes {
    public router: express.Router;
    private awardController: AwardController = new AwardController();

    constructor() {
        this.router = express.Router();

        this.router.get('/award', this.awardController.getAward);

        this.router.get('/startApp', this.awardController.startApp);
    }
}

export default new ApiRoutes().router;
