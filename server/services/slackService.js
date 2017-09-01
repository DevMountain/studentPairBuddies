var axios = require('axios');

module.exports = {
  sendSlackMessge(channel, message){
    var payload ={
      channel: channel,
      text: message,
      username: 'Slack Service'
    }

    axios.post('https://hooks.slack.com/services/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', payload)
    .then(response => console.log(response.data))
    .catch(err=>console.error(err));
  }
}
