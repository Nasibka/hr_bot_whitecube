const bodyParser = require("body-parser");
const mainRouter = require('../routes/index');
const { router } = require('./telegram');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );

    app.use('/', mainRouter);
    app.use('/bot', router);
}
