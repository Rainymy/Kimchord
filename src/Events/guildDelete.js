const { updateActivity } = require('./activity.js');

async function guildDelete(guild, client) {
  if (guild.name === undefined) { return; }
  
  console.log("Left from server so Sad");
  updateActivity(client);
  return;
}

module.exports = guildDelete;