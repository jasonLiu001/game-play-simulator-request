import * as express from 'express';
import {AppController} from "../controller/AppController";

let router: express.Router = express.Router(),
    appController: AppController = new AppController();

//启动app
router.get('/start', appController.start);

//停止app
router.post('/stop', appController.stop);

module.exports = router;
