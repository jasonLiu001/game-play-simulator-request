import {Config, CONFIG_CONST} from "../../../config/Config";
import {TimeService} from "../../time/TimeService";
import {PlatformAbstractBase} from "../PlatformAbstractBase";
import Promise = require('bluebird');
import {EnumAwardMode} from "../../../models/EnumModel";
import {ErrorService} from "../../ErrorService";
let log4js = require('log4js'),
    log = log4js.getLogger('Vbc02LotteryService');

export class Vbc02LotteryService extends PlatformAbstractBase {

}