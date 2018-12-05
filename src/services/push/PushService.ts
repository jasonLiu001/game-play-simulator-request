import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {LotteryDbService} from "../dbservices/ORMService";
import {InvestPushInfo} from "../../models/db/InvestPushInfo";

let log4js = require('log4js'),
    log = log4js.getLogger('PushService');

export class PushService {
    /**
     *
     * 发送
     */
    public async send(title: string, content: string): BlueBirdPromise<any> {
        return LotteryDbService.getInvestPushInfoHistory(1)
            .then((investPushInfoArray: Array<InvestPushInfo>) => {
                if (investPushInfoArray.length == 0) return BlueBirdPromise.reject("invest_push table is empty.");

                let investPushInfo: InvestPushInfo = investPushInfoArray[0];

            });
    }
}
