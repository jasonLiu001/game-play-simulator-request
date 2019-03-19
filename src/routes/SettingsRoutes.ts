import * as express from 'express';
import {SettingsController} from "../controller/SettingsController";

let router: express.Router = express.Router(),
    settingsController = new SettingsController();

//更新设置项
router.post('/updateSettingsByKey', settingsController.updateSettingsByKey);

//获取所有设置项列表
router.get('/getAllSettings', settingsController.getAllSettings);

module.exports = router;
