import {Request, Response} from "express";
import BlueBirdPromise = require('bluebird');
import {ResponseJson} from "../models/ResponseJson";
import {SettingTableService} from "../services/dbservices/services/SettingTableService";
import {SettingsInfo, UpdateSettingsInfo} from "../models/db/SettingsInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('SettingsController');

export class SettingsController {
    /**
     *
     * 获取所有设置项列表
     */
    async getAllSettings(req: Request, res: Response): BlueBirdPromise<any> {
        let jsonRes: ResponseJson = new ResponseJson();

        SettingTableService.getSettingsInfoList()
            .then((settingArray: Array<SettingsInfo>) => {
                let successMsg: string = "获取设置项列表成功";
                jsonRes.success(successMsg, settingArray);
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "获取设置项列表失败";
                jsonRes.fail(errMsg, e.message);
                return res.status(200).send(jsonRes);
            });
    }

    /**
     *
     * 更新设置项
     */
    async updateSettingsByKey(req: Request, res: Response): BlueBirdPromise<any> {
        let settings: UpdateSettingsInfo = new UpdateSettingsInfo();
        settings.key = req.query.key;
        settings.value = req.query.value;

        let jsonRes: ResponseJson = new ResponseJson();

        SettingTableService.saveOrUpdateSettingsInfo(settings)
            .then((settingsInfo: SettingsInfo) => {
                let successMsg: string = "设置更新成功";
                jsonRes.success(successMsg, settingsInfo);
                return res.status(200).send(jsonRes);
            })
            .catch((e) => {
                let errMsg: string = "设置更新失败";
                jsonRes.fail(errMsg, e.message);
                return res.status(200).send(jsonRes);
            });
    }
}
