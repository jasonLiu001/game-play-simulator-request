import * as express from 'express';
import {AwardController} from "../controller/AwardController";

let router: express.Router = express.Router(),
    awardController: AwardController = new AwardController();

//获取最新一期的奖号信息
router.get('/getLatestAwardInfo', awardController.getLatestAwardInfo);
//更新最新一期奖号
router.post('/updateAward', awardController.updateAward);
//更新历史奖号
router.post('/updateHistoryAward', awardController.updateHistoryAward);

module.exports = router;