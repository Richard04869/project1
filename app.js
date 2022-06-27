var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios');
const auth = require('./routes/auth');
const session = require("express-session"); 
const MongoDBStore = require('connect-mongodb-session')(session);


// *********************************************************** //
//  Loading JSON datasets
// *********************************************************** //
//const courses = require('./public/data/courses20-21.json')

// *********************************************************** //
//  Loading models
// *********************************************************** //

// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/timsCS153aSum22?retryWrites=true&w=majority'

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
// fix deprecation warnings
//mongoose.set('useFindAndModify', false); 
//mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});

// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}
/*
  Load MongoDB models 
*/
//const ToDoItem = require('./models/ToDoItem');
//const Schedule = require('./models/Schedule');
//const Course = require('./models/Course')
const History = require('./models/BrowseHistory');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const BrowseHistory = require('./models/BrowseHistory');

var app = express();

var store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret 7f89a789789as789f73j2krklfdslu89fdsjklfds',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(layouts);
app.use(auth)

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/signup',(req,res,next) => {
  res.render('signup')
})

  app.get('/views',(req,res,next) => {
    isLoggedIn,
    res.render('views')
  })
    
  app.post('/views',
  isLoggedIn,
    async (req,res,next) => {
      try {
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
    }catch(e){
      next(e);
     }
    })

  app.get('/addarticle/:article/:date',
    isLoggedIn,
    async (req,res,next) => {
     try {
       const HistItem = 
          new BrowseHistory(
           {
            userId: {type:Schema.Types.ObjectId, ref:'User'},
            article: article,
            view: view,
            date: date,
            createdAt: Date,
           }
           )
       await HistItem.save();
       res.redirect('/HistorybyArticle')
     }catch(e) {
       next(e)
     }
    }
 )

 app.get('/HistorybyArticle',
  (req,res,next) => {
    res.locals.articles =[]
    console.log('rendering HistorybyArticle')
    res.render('HistorybyArticle')
})
  


app.post('/HistorybyArticle',
  async (req,res,next) => {
    try{
      const article = req.body.article;
      const starttime = req.body.starttime;
      const endtime = req.body.endtime;
      const data = await Hostiry.find({
        article:article,
        starttime:starttime, 
        endtime:endtime,
        view:{$gt:700}
      })
               .sort({enrolled:-1})
      //res.json(data); 
      res.locals.articles = data;
      res.render('HistorybyArticle');

    }catch(e){
      next(e)
    }
  }
)


    
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
