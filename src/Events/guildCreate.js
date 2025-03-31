"use strict";

const { Guild, Client } = require('discord.js');
const chalk = require('chalk');

const { updateActivity } = require('./activity.js');
const { saveDefaultData } = require('../Components/startup/serverData.js');

/**
* @param {Guild} guild
* @param {Client} client
* @returns
*/
async function guildCreate(guild, client) {
  if (guild.name === undefined) { return; }

  await saveDefaultData(guild.id, guild.name);

  console.log(chalk.yellow(guild.id), "Joined a server YEAY");
  updateActivity(client);
  return;
}

module.exports = guildCreate;
