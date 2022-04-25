const { updateActivity } = require('./activity.js');

async function ready(event, client) {
  console.info("---------------------------------");
  console.log(`--- Logged in as ${client.user.tag}! ---`);
  console.info("---------------------------------");
  
  updateActivity(client);
}

module.exports = ready;