import * as express from 'express';
import {InvestController} from "../controller/InvestController";

let router: express.Router = express.Router(),
    investController: InvestController = new InvestController();

//登录并执行投注
router.post('/manualInvest', investController.manualInvest);

//撤单
router.post('/manualCancelInvest', investController.manualCancelInvest);

//手动更新盈利
router.post('/manualCalculateWinMoney', investController.manualCalculateWinMoney);

//获取invest和invest_total表所有投注记录
router.get('/getInvestList', investController.getInvestList);

//获取投注详情
router.get('/getInvestInfo', investController.getInvestInfo);

//查询利润列表
router.get('/getProfitList', investController.getProfitList);

module.exports = router;
