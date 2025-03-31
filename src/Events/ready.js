const { updateActivity } = require('./activity.js');
const { Client } = require('discord.js');

/**
* @param {*} event
* @param {Client} client
* @returns
*/
async function ready(event, client) {
  console.info("---------------------------------");
  console.log(`--- Logged in as ${client.user.tag}! ---`);
  console.info("---------------------------------");

  updateActivity(client);
  // client.user.setUsername('newName')
  // .catch(error => { console.log(error); });
}

module.exports = ready;