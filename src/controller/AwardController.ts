import {Request, Response} from 'express';
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');

let log4js = require('log4js'),
    log = log4js.getLogger('AwardController');

export class AwardController {

    /**
     *
     * 获取奖号列表
     */
    public getAwardList(req: Request, res: Response) {
        res.status(200).send({
            message: 'Success! getAwardList invoked!'
        })
    }

    /**
     *
     * 更新奖号
     */
    public updateAward(req: Request, res: Response) {
        res.status(200).send({
            message: 'Success! updateAward invoked!'
        })
    }
}

