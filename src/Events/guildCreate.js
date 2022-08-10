const { updateActivity } = require('./activity.js');

async function guildCreate(guild, client) {
  if (guild.name === undefined) { return; }
  
  console.log("Joined a server YEAY");
  updateActivity(client);
  return;
}

module.exports = guildCreate;