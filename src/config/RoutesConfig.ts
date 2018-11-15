import {AwardController} from "../controller/AwardController";

export class RoutesConfig {
    public awardController: AwardController = new AwardController();

    public routes(app): void {
        //router to award controller
        app.route('/award')
            .get(this.awardController.getAward);

        //router to startApp controller
        app.route('/startApp')
            .get(this.awardController.startApp);
    }
}
