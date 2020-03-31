const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const app = express();
const session = require('express-session');
const store = require("session-file-store")(session);

app.all("*", function(req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  next();
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(session({
  secret: 'My Password Key',
  resave: false,
  saveUninitialized: true,
  store: new store()
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// const indexRouter = require('./routes/index');
const mainRouter = require('./routes/main');
const restRouter = require('./routes/rest');
const signUpRouter = require('./routes/signup');


// app.use('/', indexRouter);
app.use('/', mainRouter);
app.use('/rest', restRouter);
app.use('/signup', signUpRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("~~~~~~~~~~~~0");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("~~~~~~~~~~~~1", req.url);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.log("~~~~~~~~~~~~2");
});








module.exports = app;