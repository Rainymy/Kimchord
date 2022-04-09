"use strict";
const { validatePermissions, PRESETS } = require('./src/Components/permissions.js');
const { exec_command } = require('./src/Components/switch.js');
const { printToTerminal, validateCommand } = require('./src/Components/util.js');
const { updateActivity, callbackFn } = require('./src/Events/activity.js');

const voiceStateUpdate = require('./src/Events/voiceStateUpdate.js');
const guildCreate = require('./src/Events/guildCreate.js');
const guildDelete = require('./src/Events/guildDelete.js');
const disconnect = require('./src/Events/disconnect.js');

const { loadServerData, saveDefaultData } = require('./src/Components/serverData.js');
const { credential, server, devs_ids } = require("./config.json");

const { Client } = require('discord.js');
const client = new Client({ intents: PRESETS.intents });

const queue = new Map();
const devs_id_list = devs_ids ?? [];
const server_guilds = loadServerData();

client.on("ready", async (event) => {
  console.info("---------------------------------");
  console.log(`--- Logged in as ${client.user.tag}! ---`);
  console.info("---------------------------------");
  
  updateActivity(client);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) { return; }
  
  const bot_id = client.user.id;
  const validation = validatePermissions(message.channel, bot_id, PRESETS.channel);
  
  if (validation.stop) { return; }
  if (validation.error) { return message.channel.send(validation.comment); }
  
  let guilds_settings = server_guilds.get(message.guild.id);
  if (!guilds_settings) {
    guilds_settings = await saveDefaultData(server_guilds, message);
  }
  
  const args = message.content.split(" ");
  const searchString = args.slice(1).join(" ");
  
  if (!validateCommand(args[0], guilds_settings.prefix)) { return; }
  
  const command = args[0].substring(guilds_settings.prefix.length);
  const data = {
    prefix: guilds_settings.prefix,
    guilds_settings: guilds_settings,
    all_server_settings: server_guilds,
    serverHost: server.location,
    serverPort: server.port,
    serverURL: `${server.location}:${server.port}`,
    isDev: devs_id_list.includes(message.author.id),
    cb: callbackFn
  }
  
  try { await exec_command(message, data, searchString, queue, command, client); }
  catch (e) { printToTerminal("New ERROR found:", e); }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  return await voiceStateUpdate(oldState, newState, client, queue);
});

client.on('guildCreate', (guild) => guildCreate(guild, client));
client.on("guildDelete", (guild) => guildDelete(guild, client))
client.on('disconnect', async (erMsg, code) => disconnect(client, erMsg, code));

client.login(credential.token);