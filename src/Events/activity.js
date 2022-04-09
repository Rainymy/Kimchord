const { SHOW_SERVER_COUNT, prefix } = require("../../config.json");
let showServerCount = SHOW_SERVER_COUNT ?? true;

function callbackFn(client, event, data) {
  if (event === "updateActivity") {
    showServerCount = data;
    return updateActivity(client);
  }
  if (event === "customActivity") {
    return updateActivity(client, data);
  }
}

function updateActivity(client, customText) {
  if (!showServerCount && typeof customText === "string") {
    return client.user.setActivity(customText);
  }
  
  if (typeof customText === "string") {
    return client.user.setActivity(`${prefix}help | ${customText}`);
  }
  
  if (!showServerCount) { return client.user.setActivity( `${prefix}help` ); }
  return client.user.setActivity(
    `${prefix}help [Serving ${client.guilds.cache.size} servers]`
  );
}

module.exports = {
  updateActivity: updateActivity,
  callbackFn: callbackFn
}