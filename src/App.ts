import * as express from "express";
import * as bodyParser from "body-parser";
import {RoutesConfig} from "./config/RoutesConfig";

class App {

    public app: express.Application;
    public route: RoutesConfig = new RoutesConfig();

    constructor() {
        this.app = express();
        this.config();
        this.route.routes(this.app);
    }

    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({extended: false}));
    }

}

export default new App().app;
