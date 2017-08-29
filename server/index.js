// EXTERNAL MODULES //
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');

// CONFIG //
var config = require('./config');

// SERVICES //
var passport = require('./services/passport');

// EXPRESS //
var app = express();

app.use(express.static(__dirname + './../dist'));
app.use(bodyParser.json());

// SESSION AND PASSPORT
app.use(session({
  secret: config.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

// POLICIES //
var isAuthed = function(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).send();
  return next();
};

// Passport Endpoints
app.post('/api/login', passport.authenticate('local', {
  successRedirect: '/api/me'
}));
app.get('/api/logout', function(req, res, next) {
  req.logout();
  return res.status(200).send('logged out');
});

// CRON //
var cron = require('./cron/cronJob.js');
cron.notify_cohorts();
cron.pair_up_students();

// CONTROLLERS //
var userCtrl = require('./controllers/userCtrl');
var cohortCtrl = require('./controllers/cohortCtrl');
var pairCtrl = require('./controllers/pairCtrl');

// USER ENDPOINTS
app.post('/api/register', userCtrl.register);
app.get('/api/me', isAuthed, userCtrl.me);
app.get('/api/user', userCtrl.read);
app.post('/api/user', userCtrl.add);
app.put('/api/user/:id', userCtrl.update);
app.delete('/api/user/:id', userCtrl.delete);

// PAIR ENDPOINT
app.put('/api/cohort/pair', pairCtrl.pair);

// COHORT ENDPOINTS
app.get('/api/cohort', cohortCtrl.read);
app.post('/api/cohort', cohortCtrl.create);
app.put('/api/cohort/:id', cohortCtrl.update);
app.delete('/api/cohort/:id', cohortCtrl.delete);
app.get('/api/cohort/pairs', cohortCtrl.getPairs);
app.get('/api/cohort/:id/slack', cohortCtrl.slackPairs);


// CONNECTIONS //
var mongoURI = config.MONGO_URI;
var port = config.PORT;

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI);
mongoose.connection.once('open', function() {
  console.log('Connected to Mongo DB at', mongoURI);
  app.listen(port, function() {
    console.log('Listening on port '+ port);
  });
});
