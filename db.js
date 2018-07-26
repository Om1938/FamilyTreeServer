var neo4j = require('neo4j-driver').v1;
var bcrypt = require('bcrypt-nodejs');
var $ = require('jquery');

var jwt = require('jsonwebtoken');
var secret = "IlOvEmYiNdIa";
var window = require("js-base64").Base64;
var driver = neo4j.driver('bolt://107.23.132.215:33004', neo4j.auth.basic('neo4j', 'airships-instance-currency'));
var session = driver.session();

module.exports = {
  demofun: function (req, res) {
    res.send("Connected to family tree server");
  },
  checkusername: function (req, res) {

  },
  register: function (req, res) {
    console.log(req.body);
    var uname = req.body.username;
    var tmppass = req.body.password;
    console.log(tmppass);
    var pass = "";
    bcrypt.hash(tmppass, null, null, function (err, hash) {
      if (err) throw err;
      session
        .run('CREATE (n:user{username:"' + uname + '", password:"' + hash + '"}) RETURN n')
        .then(function (result) {
          result.records.forEach(function (record) {
            console.log(record);
            res.send({ message: "Success", res: record });
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
            res.json({ error: { success: false, message: 'Invalid Username/Password' } });
        } else {
          res.json({ error: { success: false, message: 'Invalid Username/Password' } });
        }
      });
  },
  getdata: function (req, res) {
    session
      .run('MATCH (n:user)-[r]->(m:user) RETURN n,r,m ')
      .then(function (result) {
        var keysarr = [];
        var relarr = [];
        var nodearr = [];
        //res.send(result);
        result.records[0]["keys"].forEach(function (record) {
          keysarr.push(record);
        })
        var ids = [];
        result.records.forEach(function (record) {
          keysarr.forEach(function (key) {
            var rec = record.get(key);
            var recs = {};
            if (ids.includes(rec.identity.low)) {
              return;
            }
            ids.push(rec.identity.low);
            recs.id = rec.identity.low;
            recs.properties = rec.properties;
            if (!rec.start) {
              recs.labels = rec.labels;
              nodearr.push(recs);
            } else {
              recs.start = rec.start.low;
              recs.end = rec.end.low;
              relarr.push(recs);
            }
          });
        })
        res.send({ nodes: nodearr, relations: relarr });
      })
  },
  delNode: function (req, res) {
    var uname = req.body.username;
    session
      .run('MATCH (n:user{username:"' + uname + '"}) DETACH DELETE n')
      .then(function (result) {
        if (result.summary.counters._stats.nodesDeleted) {
          res.send({ success: true, message: uname + " Successfully Deleted" });
        } else {
          res.send({ success: false, message: uname + " Not Found" });
        }
      }).catch();
  },
  updateNode: function (req, res) {
    console.log("Khus to bhot honge aap aaj!!");
  },
  addRelation: function (req, res) {
    var parent = req.body.parent;
    var type = req.body.type;
    var child = req.body.child;
    session
      .run('MATCH (parent:user{username:"' + parent + '"}) MATCH (child:user{username:"' + child + '"}) MATCH (parent)-[data:' + type + ']->(child) RETURN data')
      .then(function (result) {
        if (!result.records[0]) {
          session
            .run('MATCH (parent:user{username:"' + parent + '"}) MATCH (child:user{username:"' + child + '"}) CREATE (parent)-[:' + type + '{}]->(child)')
            .then(function (result) {
              if (result.summary.counters._stats.relationshipsCreated) {
                res.send({ success: true, message: " Successfully Added" });
              } else {
                res.send({ success: false, message: parent + " or " + child + " Not Found" });
              }
            }).catch();
        } else {
          res.send({ success: false, message: " Relationship already exists! " })
        }
      }).catch();
  }
}