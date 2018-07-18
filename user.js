 require('mongoose').model('User');

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {
  createUsers: function (req, res) {
    var regn = req.body;
    console.log(regn);
    new User({room:regn.room ,name:regn.name ,id_proof : regn.id_proof,NoOfAdults : regn.NoOfAdults,NoOfChildren : regn.NoOfChildren,NoofDays : regn.NoofDays,date:regn.date})
      .save(function (err) {
        if (err) {
          res.status(504);
          res.end(err);
        } else {
          console.log('user saved');
          res.end();
        }
      });
  },
  seeResults: function (req, res, next) {
    User.find({}, function (err, docs) {
      if (err) {
       throw err;
      } else {
        for (var i = 0; i < docs.length; i++) {
         console.log('user:', docs[i].name);
        }
        res.end(JSON.stringify(docs));
      }
    });
  },
  delete: function( req, res, next) {
    console.log(req.params.id);
    User.find({ _id: req.params.id}, function(err) {
      if(err) {
        req.status(504);
        req.end();
        console.log(err);
      }
    }).remove(function (err) {
      console.log(err);
      if (err) {
        res.end(err);            
      } else {
        res.end();
      }
    });
  }
}