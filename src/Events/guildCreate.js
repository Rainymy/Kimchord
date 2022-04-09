const { updateActivity } = require('./activity.js');

async function guildCreate(guild, client) {
  console.log("Joined a server YEAY");
  updateActivity(client);
  return;
}

module.exports = guildCreate;