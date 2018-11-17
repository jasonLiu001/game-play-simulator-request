import * as express from 'express';
import {AwardController} from "../controller/AwardController";

let router: express.Router = express.Router(),
    awardController: AwardController = new AwardController();

//获取奖号列表
router.get('/getAwardList', awardController.getAwardList);

module.exports = router;