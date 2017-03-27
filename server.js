
var express = require('express');
var config = require('./server/configure');
var app =  express();
var mongoose = require('mongoose');

//app level constants
app.set('port',process.env.PORT || 3300);
app.set('views', __dirname + '/views');
app = config(app);

mongoose.connect('mongodb://localhost/imguru');
mongoose.connection.on('open',function(){
  console.log('mongoose connected');
});

// app.get('/',function (req, res){
//   res.send('Hello world!');
// });

app.listen(app.get('port'),function(){
  console.log('Server up at http://localhost:'+app.get('port'));
});
