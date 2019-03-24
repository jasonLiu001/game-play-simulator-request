import * as bodyParser from "body-parser";
import * as express from "express";

let app: express.Application = express();
const PORT = 6080;

let log4js = require('log4js'),
    errorhandler = require('errorhandler'),
    path = require('path');
log4js.configure(path.resolve(__dirname, '.', 'config/log4js.json'));

//日志文件
let log = log4js.getLogger('Server');

//api 路由配置
let appRoutes = require("./routes/AppRoutes"),
    awardRoutes = require("./routes/AwardRoutes"),
    investRoutes = require("./routes/InvestRoutes"),
    pushRoutes = require("./routes/PushRoutes"),
    settingsRoutes = require("./routes/SettingsRoutes");

// support application/json type post data
app.use(bodyParser.json());
//support application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: false}));
//static resources 访问时不需要添加static到路径  http://localhost:6080/lib/lodash.js
app.use(express.static(__dirname + '/static'));
//添加errorHandler
app.use(errorhandler({dumpExceptions: true, showStack: true}));
//添加log4js到express
app.use(log4js.connectLogger(log, {level: log4js.levels.DEBUG}));

//register all routes
app.use('/app', appRoutes);
app.use('/award', awardRoutes);
app.use('/invest', investRoutes);
app.use('/push', pushRoutes);
app.use('/settings', settingsRoutes);

app.listen(PORT, () => {
    log.info('Express server listening on port ' + PORT);
});

process.on('uncaughtException', function (exception) {
    console.error('uncaughtException: ,', exception);
    log.error('uncaughtException: %s', JSON.stringify(exception)); // to see your exception details in the console
});

//Promise 异常捕获
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, ' reason: ', reason);
    log.error('Unhandled Rejection at: %s, reason: %s', JSON.stringify(p), JSON.stringify(reason));
});
