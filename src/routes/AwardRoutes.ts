import * as express from 'express';
import {AwardController} from "../controller/AwardController";

let router: express.Router = express.Router(),
    awardController: AwardController = new AwardController();

//获取最新的奖号信息
router.get('/getLatestAwardInfo', awardController.getLatestAwardInfo);
//更新奖号
router.post('/updateAward', awardController.updateAward);

module.exports = router;