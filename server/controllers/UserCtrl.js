// REQUIRE DEPENDENCIES
// ============================================================
var User = require('./../models/user');

// EXPORT METHODS
// ============================================================
module.exports = {

  // CRUD METHODS
  // ============================================================
  read: function(req, res) {
    User.find(req.query, function(err, user) {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(user);
    });
  },
  add: function(req, res) {
    if (!req.body.cohort)
      return res.status(400).send('No cohort selected');
    if (!req.body.username){
      console.log(req.body);
      req.body.username = req.body.name + req.body.cohort;
    }
    User.find({cohort: req.body.cohort}, (err, users) => {

      req.body.partners = users.map(user => user._id);

      User.create(req.body, (err, user) => {

        users.forEach(otherUser => {
          otherUser.update({ $push: { partners: user._id } }, (err, users) => {
          });
        });

        err ? res.status(404).send(err) : res.status(200).send('User created successfully');
      });

    });
  },
  update: function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
      if (err) {
        return res.status(404).send(err);
      }
      res.status(200).send(user);
    });
  },
  delete: function(req, res) {
    var id = req.params.id;

    User.findByIdAndRemove(id, function(err, user) {
      if (err) {
        return res.status(404).send(err);
      }

      User.update({ partners: id }, { $pull: { partners: id } }, { multi: true }, function(err, users) {
        if (err)
          return res.status(404).send(err);

          res.status(200).send(user);
      });
    });
  },

  // OTHER METHODS
  // ============================================================
  register: function(req, res) {
    req.body.user_type = "mentor";

    User.create(req.body, function(err, result) {
      if(err) return res.status(500).send(err);
      newUser = result.toObject();
      delete newUser.password;
      res.status(200).json(newUser);
    });
  },

  me: function(req, res) {
    return res.status(200).json(req.user);
  }

};
