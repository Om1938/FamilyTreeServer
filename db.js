var neo4j = require('neo4j-driver').v1;
var bcrypt = require('bcrypt-nodejs');

var jwt = require('jsonwebtoken');
var secret = "IlOvEmYiNdIa";
var window = require("js-base64").Base64;
var driver = neo4j.driver('bolt://52.86.4.26:37194', neo4j.auth.basic('neo4j', 'shipping-can-mittens'));
var session = driver.session();

module.exports = {
  demofun: function (req, res) {
    res.send("Connected to family tree server");

  },
  checkusername: function (req, res) {

  },
  register: function (req, res) {
    var uname = req.body.username;
    var tmppass = req.body.password;
    console.log(tmppass);
    var pass = "";
    bcrypt.hash(tmppass, null, null, function (err, hash) {
      if (err) throw err;
      session
        .run('CREATE (n:user{username:"' + uname + '", password:"' + hash + '"}) RETURN n.username')
        .then(function (result) {
          result.records.forEach(function (record) {
            console.log(record);
          })
        }).catch();
    });
  },
  login: function (req, res) {
    var uname = req.body.username;
    var tmppass = req.body.password;
    console.log(tmppass);
    //query
    session
      .run('MATCH (n:user{username:"' + uname + '"}) RETURN n')
      .then(function (result) {
        if (result.records.length == 1) {
          var pass = (result.records[0]._fields[0].properties.password);
          if (bcrypt.compareSync(tmppass, pass)) {
            var token = jwt.sign({ username: uname }, secret, { expiresIn: '12h' });
            res.json({ success: true, message: 'User Authenticated', token: token });
          } else
            res.json({error : { success: false, message: 'Invalid Username/Password' }});
        } else {
          res.json({error : { success: false, message: 'Invalid Username/Password' }});
        }
      });
  }
}
