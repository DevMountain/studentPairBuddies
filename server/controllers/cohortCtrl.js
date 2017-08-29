// REQUIRE DEPENDENCIES
// ============================================================
var Cohort = require('./../models/cohort');
var User = require('./../models/user');
var cronJob = require('./../cron/cronJob');

// EXPORT METHODS
// ============================================================
module.exports = {

  // CRUD METHODS
  // ============================================================
  read: function(req, res) {
    Cohort.find(req.query, function(err, cohort) {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(cohort);
    });
  },
  create: function(req, res) {
    Cohort.create(req.body, function(err, cohort) {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(cohort);
    });
  },
  update: function(req, res) {
    Cohort.findByIdAndUpdate(req.params.id, req.body, function(err, cohort) {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(cohort);
    });
  },
  delete: function(req, res) {
    Cohort.findByIdAndRemove(req.params.id, function(err, cohort) {
      if (err)
        return res.status(500).send(err);

      User.remove({cohort: req.params.id}, function() {
        if (err)
          return res.status(400).send(err);

        return res.status(200).send('Cohort deleted successfully');
      });
    });
  },

  // OTHER METHODS
  // ============================================================
  getPairs: function(req, res) {
    Cohort
      .findOne(req.query)
      .populate({
        path: 'pairs',
        model: 'user'
      })
      .exec(function(err, cohorts) {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send(cohorts);
      });
  },
  slackPairs: function(req, res){
    cronJob.notify_cohort(req.params.id).then(response=>{
       res.send(response);
    }).catch(err=>res.send(err));

  }

};
