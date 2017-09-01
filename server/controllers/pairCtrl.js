var Cohort = require('./../models/cohort.js');
var User = require('./../models/user.js');

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}

function pairUp(arr) {
  var pairs = [];

  arr = shuffle(arr);

  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i].partners.indexOf(arr[j]._id) != -1 && arr[j].partners.indexOf(arr[i]._id) != -1) {
        var two = arr.splice(j, 1)[0];
        var one = arr.splice(i, 1)[0];
        pairs.push([one, two]);
        i--;
        break;
      }
    }
  }

  if (arr.length == 1) {
    pairs.push(arr);
  }

  return pairs;
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
