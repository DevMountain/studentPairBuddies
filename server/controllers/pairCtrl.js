var Cohort = require('./../models/cohort.js');
var User = require('./../models/user.js');
var _ = require('underscore');

function pairUp(arr) {
  var pairs = [];

  arr = _.shuffle(arr);
  console.log(arr);

  return arr.reduce((all, cur)=>{
    if (Array.isArray(all[all.length-1]) && all[all.length-1].length ==1){
      all[all.length-1].push(cur._id);
    }else{
      all.push([cur._id]);
    }
    console.log(all);
    return all
  }, [])
}

function resetStudents(id) {
  User.find({cohort: id}, (err, users) => {
    if (err) return false;

    for (var i = 0; i < users.length; i++) {
      users[i].partners = [];
      for (var j = 0; j < users.length; j++) {
        if (users[i]._id !== users[j]._id) {
          users[i].partners.push(users[j]._id);
        }
      }
    }

    users.forEach(user => user.save((err, user) => {}));

    return true;
  });
}

function pair(pairs) {

  function async(i) {
    if (i >= pairs.length)
      return fin();

    if (!pairs[i][0] || !pairs[i][1])
      return async(++i);

    User.findByIdAndUpdate(pairs[i][0], { $pull: { partners: pairs[i][1] } }, (err, user) => {
      if (err) return false;
        User.findByIdAndUpdate(pairs[i][1], { $pull: { partners: pairs[i][0] } }, (err, user) => {
          if (err) return false;

          async(++i);
        });
    });
  }
  async(0);

  function fin() {
    return true;
  }
}

module.exports = {
  pair: function (req, res) {
    var query = req ? req.query : {};
    !req ? query.notify = true : null;

    Cohort.find(query, function(err, cohorts) {
      if (err)
        return console.log('Can\'t find cohorts in pair_up_students CRON job: ', err);

      User.find({user_type: 'student', pair: true}, function(err, students) {
        if (err)
          return console.log('Can\'t find users in pair_up_students CRON job: ', err);

        for (var i = 0; i < cohorts.length; i++) {
          var reset = false;

          var filteredStudents = students.filter(student => {
            if (String(cohorts[i]._id) == String(student.cohort)) {
              if (student.partners.length < 2) {
                reset = true;
              }
              return true;
            }
            else {
              return false;
            }
          });

          if (reset)
            resetStudents(cohorts[i]._id);

          cohorts[i].pairs = pairUp(filteredStudents);

        }

        cohorts.forEach((cohort, i, arr) => cohort.save({multi: true}, function(err, updatedCohort) {
          if (err)
            return console.log('Can\'t update cohorts in pair_up_students CRON job: ', err);

          pair(updatedCohort.pairs);
          console.log(`Pairs for cohort ${updatedCohort.title} are updated!`);

          if (res && i === arr.length - 1)
            return res.status(200).send('Paired up')
        }));
      });
    });
  }
};
