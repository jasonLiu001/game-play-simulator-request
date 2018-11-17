import {Request, Response} from "express";
import {InvestBase} from "../services/invest/InvestBase";

let abstractInvestBase = new InvestBase();

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