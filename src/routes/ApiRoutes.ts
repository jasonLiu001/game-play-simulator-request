import * as express from 'express';
import {AwardController} from "../controller/AwardController";
import {AppController} from "../controller/AppController";

let router: express.Router = express.Router(),
    appController: AppController = new AppController(),
    awardController: AwardController = new AwardController();

//启动app
router.get('/startApp', appController.startApp);
//获取奖号列表
router.get('/getAwardList', awardController.getAwardList);

// “/api” 路径路由
module.exports = router;
