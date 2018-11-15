import * as express from "express";
import * as bodyParser from "body-parser";

let rootRoutes = require("./routes/RootRoutes");
let apiRoutes = require("./routes/ApiRoutes");

let app: express.Application = express();

// support application/json type post data
app.use(bodyParser.json());
//support application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: false}));
//static resources 访问时不需要添加static到路径  http://localhost:6080/lib/lodash.js
app.use(express.static(__dirname + '/static'));

//register root routes
app.use('/', rootRoutes);

//register api routes
app.use('/api', apiRoutes);

module.exports = app;
