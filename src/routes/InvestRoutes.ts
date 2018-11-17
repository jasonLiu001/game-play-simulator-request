import * as express from 'express';
import {InvestController} from "../controller/InvestController";

let router: express.Router = express.Router(),
    investController: InvestController = new InvestController();

//执行投注
router.get('/execute', investController.execute);

module.exports = router;