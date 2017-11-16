import {AbstractRuleBase} from "./AbstractRuleBase";
import {IRules} from "./IRules";
import _ = require('lodash');
import Promise = require('bluebird');
import {CommonKillNumberResult} from "../../models/RuleResult";

let log4js = require('log4js'),
    log = log4js.getLogger('SumValues');

/**
 *
 * 和值杀号
 */
export class SumValues extends AbstractRuleBase implements IRules<CommonKillNumberResult> {
    filterNumbers(): Promise<CommonKillNumberResult> {
        return Promise.resolve(new CommonKillNumberResult());
    }
}