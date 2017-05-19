# Student Pair Buddies
For pairing up of students and randomizing for presentations

## Setup
1. Fork and clone
2. `npm i`
3. `gulp` in new tab
4. Add config file
4. `nodemon`

server/config.js
```javascript
module.exports = {
  PORT: 3000,
  MONGO_URI: 'mongodb://localhost:27017/student-pair-buddies', // Change your URI
  SESSION_SECRET: 'secret', // Change your secret
};
```
