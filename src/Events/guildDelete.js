"use strict";

const { Client, Guild } = require('discord.js');
const chalk = require('chalk');

const { updateActivity } = require('./activity.js');
const { removeServerData } = require('../Components/startup/serverData.js');

/**
* @param {Guild} guild
* @param {Client} client
* @returns
*/
async function guildDelete(guild, client) {
  if (guild.name === undefined) { return; }

  const err = await removeServerData(guild.id);
  if (err) { console.log("Encountered error <deleting>. ", err); }

  console.log(chalk.yellow(guild.id), "Left from server so Sad");
  updateActivity(client);
  return;
}

module.exports = guildDelete;
