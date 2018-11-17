import {Request, Response} from 'express';

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
}

