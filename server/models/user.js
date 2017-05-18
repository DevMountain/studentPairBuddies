var mongoose = require('mongoose');
var objectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcryptjs');

var user = new mongoose.Schema({
  name: { type: String },
  username: { type: String, unique: true},
  password: { type: String },
  partners: [{type: objectId, ref: "user"}],
  cohort: {type: objectId, ref: 'cohort'},
  user_type: {type: String, default: 'student', enum: ['student', 'mentor', 'admin']},
  pair: {type: Boolean, default: true}
});

user.pre('save', function(next) {
	var user = this;

  if (!user.isModified('password'))	return next();
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  return next(null, user);
});

user.methods.verifyPassword = function(reqBodyPassword) {
  var user = this;
  return bcrypt.compareSync(reqBodyPassword, user.password);
};

module.exports = mongoose.model('user', user);
