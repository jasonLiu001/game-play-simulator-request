import * as express from 'express';
import {PushController} from "../controller/PushController";

let router: express.Router = express.Router(),
    pushController = new PushController();

//保存pushtoken
router.post('/saveDeviceToken', pushController.saveDeviceToken);
//发送push
router.post('/sendPush', pushController.sendPush);

module.exports = router;
