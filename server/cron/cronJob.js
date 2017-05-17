var Cron = require('cron').CronJob;
var axios = require('axios');
var Cohort = require('./../models/cohort.js');
var User = require('./../models/user.js');
var pairCtrl = require('./../controllers/pairCtrl.js');

module.exports = {
  notify_cohorts: function() {
    console.log('Notification CRON initiated');
    new Cron(
      '0 0 13 * * 1-5',
      function () {

        Cohort
          .find({notify: true})
          .populate({
            path: 'pairs',
            model: 'user'
          })
          .exec(function(err, cohorts) {
            if (err) {
              return console.log('Couldnt find pairs');
            }

            for (var i = 0; i < cohorts.length; i++) {
              var text = "@channel Todays pairs are:\n";

              if (cohorts[i].pairs.length > 0) {
                for (var j = 0; j < cohorts[i].pairs.length; j++) {
                  var pair = cohorts[i].pairs[j];

                  if (pair.length < 2)
                    text += pair[0].name + " / Mentors\n"
                  else
                    text += pair[0].name + " / " + pair[1].name + "\n"
                }

                var payload ={
                  channel: '#' + cohorts[i].slack_channel,
                  text: text
                }

                axios.post('https://hooks.slack.com/services/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', payload)
                .then(function(response) {});
              }
            }

            console.log('Pairs have been slacked');
          });
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
