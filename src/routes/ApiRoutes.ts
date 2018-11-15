import * as express from 'express';
import {AwardController} from "../controller/AwardController";

let router: express.Router = express.Router(),
    awardController: AwardController = new AwardController();

router.get('/award', awardController.getAward);

router.get('/startApp', awardController.startApp);

// “/api” 路径路由
module.exports = router;
