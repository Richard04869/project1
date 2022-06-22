var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);


app.use('/', indexRouter);
app.use('/users', usersRouter);


    app.get('/views',(req,res,next) => {
      res.render('views')
    })
    
    app.post('/views',
      async (req,res,next) => {
        const article = req.body.article;
        const starttime = req.body.starttime;
        const endtime = req.body.endtime;
        const url="https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/"+ article + "/daily/"+ starttime + "/" +endtime
        const response = await axios.get(url)
        console.dir(response.data)
        res.locals.article = article
        res.locals.timestamp = response.data.timestamp|| []
        res.locals.items = response.data.items || []
        res.render('showViews')
      })
    


    // catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
