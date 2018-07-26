var express = require('express');
var morgan = require('morgan');
var path = require('path');
var nconf = require('./config');
const bodyParser= require('body-parser');
var ip = require("ip");

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true})); //To be reviewed
app.use(express.static(path.join(__dirname,'public')));

var db = require('./db');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
  });

app.set('port', nconf.get('PORT'));

app.get('/',db.demofun);
app.post('/register',db.register);
app.post('/login',db.login);
app.get('/getdata',db.getdata);
app.post('/delNode',db.delNode);
app.post('/updateNode',db.updateNode);
app.post('/addRelation',db.addRelation);

app.listen(app.get('port'),'0.0.0.0', function () {
    console.log('Server listening on http://'+ip.address()+":"+app.get('port'));
});
