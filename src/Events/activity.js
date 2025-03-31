const { Client, ActivityType } = require("discord.js");

const { SHOW_SERVER_COUNT, prefix } = require("../../config.json");
let showServerCount = SHOW_SERVER_COUNT ?? true;

/**
* @param {Client} client
* @param {*} event
* @param {String|Boolean} data
* @returns
*/
function callbackFn(client, event, data) {
  if (event === "updateActivity") {
    showServerCount = !!data;
    return updateActivity(client);
  }
  if (event === "customActivity") {
    return updateActivity(client, data);
  }
}

/**
* @param {Client} client
* @param {String|Boolean=} customText
* @returns
*/
function updateActivity(client, customText) {
  if (!showServerCount && typeof customText === "string") {
    return client.user.setActivity(customText);
  }

  if (typeof customText === "string") {
    return client.user.setActivity(`${prefix}help | ${customText}`);
  }

  if (!showServerCount) {
    return client.user.setActivity(`${prefix}help`);
  }
  return client.user.setActivity(
    `${prefix}help [Serving ${client.guilds.cache.size} servers]`
  );
}

module.exports = {
  updateActivity: updateActivity,
  callbackFn: callbackFn
}