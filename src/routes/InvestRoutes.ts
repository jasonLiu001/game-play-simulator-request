import * as express from 'express';
import {InvestController} from "../controller/InvestController";

let router: express.Router = express.Router(),
    investController: InvestController = new InvestController();

//登录并执行投注
router.post('/manualInvest', investController.manualInvest);

//撤单
router.post('/manualCancelInvest', investController.manualCancelInvest);

module.exports = router;