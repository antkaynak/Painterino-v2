
require('./config/config');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const {mongoose} = require('./db/mongoose');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const lobbyRouter = require('./socket/socket').lobbyRouter;


const app = express();
// const server = http.createServer(app); //using http server instead of express server

require('./socket/socket');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    next();
});



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/lobby', lobbyRouter);

module.exports.app = app;
