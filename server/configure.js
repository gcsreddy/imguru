var path = require('path'),
       routes = require('./routes'),
       express = require('express'),
       exphbs = require('express-handlebars'),
       bodyParser = require('body-parser'),
       cookieParser = require('cookie-parser'),
       morgan = require('morgan'),
       methodOverride = require('method-override'),
       errorHandler = require('errorhandler'),
       moment = require('moment'),
       multer = require('multer');
   module.exports = function(app) {
   app.use(morgan('dev'));
      app.use(bodyParser.urlencoded({'extended':true}));
      app.use(bodyParser.json());
      // app.use(bodyParser({
      //   uploadDir:path.join(__dirname,'public/upload/temp')
      // }));
      app.use(multer({dest: path.join(__dirname,
                  'public/upload/temp')}).single('file'));
      app.use(methodOverride());
      app.use(cookieParser('some-secret-value-here'));
      routes(app);//moving the routes to routes folder.
      app.use('/public/', express.static(path.join(__dirname,
              '../public')));
   if ('development' === app.get('env')) {
      app.use(errorHandler());
}
routes(app);
//we define our redering engine of choice by calling engine function
//of  app. The first parameter is the file extention that the
//rendering engine should look for namely handlebars
//the second parameter builds the engine by calling the create
//function which takes options object as a parameter and this options
//object defines a number of consts for our server.

app.engine('handlebars',exphbs({
  defaultLayout:'main',
  layoutDir: app.get('views')+'/layouts',
  partialsDir: [app.get('views')+'/partials'],//array if we have multiple dirs
  helpers:{
    timeago:function(timestamp){
      return moment(timestamp).startOf('minute').fromNow();
    }
  }
}));
app.set('view engine', 'handlebars');
return app;
};
