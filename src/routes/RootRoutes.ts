import * as express from 'express';

let router: express.Router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

// "/" 根路径路由
module.exports = router;
