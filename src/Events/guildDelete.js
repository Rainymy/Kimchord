const { updateActivity } = require('./activity.js');

async function guildDelete(guild, client) {
  console.log("Left from server so Sad");
  updateActivity(client);
  return;
}

module.exports = guildDelete;