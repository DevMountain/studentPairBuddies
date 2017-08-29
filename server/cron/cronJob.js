var Cron = require('cron').CronJob;
var Cohort = require('./../models/cohort');
var User = require('./../models/user');
var pairCtrl = require('./../controllers/pairCtrl');
var slackService = require('./../services/slackService');
var mongoose = require('mongoose');

module.exports = {
  notify_cohort: function(id) {
    return new Promise(function(resolve, reject){
    Cohort.findById(id)
      .populate({
        path: 'pairs',
        model: 'user'
      })
      .exec((err, cohort)=>{
        if (err){
          return reject(err);
        }
        if (!cohort){
          return console.error("Cohort not found");
        }
        let pairs = cohort.pairs.map((pair) => {
          if (pair.length == 2) {
            return pair[0].name + ' / ' + pair[1].name;
          }
          return pair[0].name + ' / Mentors'
        });
        text = "@channel Today's pairs are:\n" + pairs.join("\n");
        slackService.sendSlackMessge('#' + cohort.slack_channel, text)
        resolve({text:text, channel:'#' + cohort.slack_channel});
      })
    })
  },
  notify_cohorts: function() {
    console.log('Notification CRON initiated');
    new Cron(
      '0 0 0 * * 1-5',
      function() {
        Cohort
          .find({
            notify: true
          })
          .populate({
            path: 'pairs',
            model: 'user'
          })
          .exec(function(err, cohorts) {
            if (err) {
              return console.log('Couldnt find pairs');
            }
            cohorts.forEach(this.notify_cohort);
            console.log('Pairs have been slacked');
          })
      },
      null,
      true,
      ''
    )
  },

  pair_up_students: function() {
    console.log('Pairing CRON initiated');
    new Cron(
      '0 0 0 * * 1-5',
      pairCtrl.pair,
      null,
      true,
      ''
    )
  }
}
