import {Request, Response} from 'express';

export class AwardController {
    public getAward(req: Request, res: Response) {
        res.status(200).send({
            message: 'GET request successfulll!!!!'
        })
    }
}

