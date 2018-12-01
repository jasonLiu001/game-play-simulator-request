import * as express from 'express';
import {InvestController} from "../controller/InvestController";

let router: express.Router = express.Router(),
    investController: InvestController = new InvestController();

//登录并执行投注
router.post('/execute', investController.execute);

module.exports = router;