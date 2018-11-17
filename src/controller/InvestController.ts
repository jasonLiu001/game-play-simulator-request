import {Request, Response} from "express";

export class InvestController {
    /**
     *
     * 执行投注
     */
    public execute(req: Request, res: Response) {
        res.status(200).send({
            message: 'Success! getAwardList invoked!'
        })
    }
}