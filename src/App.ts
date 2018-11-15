import * as express from "express";
import * as bodyParser from "body-parser";
import rootRoutes from "./routes/RootRoutes";
import apiRoutes from "./routes/ApiRoutes";

class App {

    public app: express.Application;

    constructor() {
        this.app = express();

        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({extended: false}));

        //register root routes
        this.app.use('/', rootRoutes);

        //register api routes
        this.app.use('/api', apiRoutes);
    }
}

export default new App().app;
