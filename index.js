var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

/*Get routes*/
var index = require('./routes/index');
var user = require('./routes/user');

/*Public access to files in /public*/
app.use(express.static('public'));

/*set views and view engine*/
app.set('view engine', 'ejs');
app.set('views', './views');

//parse only json post data
app.use(bodyParser.json());

//set session
app.use(session({
  secret: 'matcha',
  resave: false,
  saveUninitialized: true
}));

//use routes
app.use(index);
app.use(user);

//Set error
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, function (){
  console.log("Good i'm listening on port 3000");
})
