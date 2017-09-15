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
        console.log(text, cohort.slack_channel);
      })
    })
  },
  notify_cohorts: function() {
    let hourTime = new Date().getUTCHours();

    Cohort
      .find({
        notify: true,
        utcHour: hourTime
      })
      .exec((err, cohorts)=>{
        if (err) {
          return console.log('Couldnt find pairs');
        }
        cohorts.forEach(cohort=>module.exports.notify_cohort(cohort._id));
      });
      console.log('Pairs have been slacked');
  },
  cron_job: function(){
    console.log('Notification CRON initiated');
    new Cron(
      '0 0 * * * 1-5',
      module.exports.notify_cohorts,
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
