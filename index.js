"use strict";
const { PRESETS } = require('./src/Components/permission/permissions.js');
const { exec_command } = require('./src/Components/startup/switch.js');
const { printToTerminal, startsAndEndsWith } = require('./src/Components/util/util.js');
const { callbackFn } = require('./src/Events/activity.js');

const onReady = require('./src/Events/ready.js');
const voiceStateUpdate = require('./src/Events/voiceStateUpdate.js');
const guildCreate = require('./src/Events/guildCreate.js');
const guildDelete = require('./src/Events/guildDelete.js');
const disconnect = require('./src/Events/disconnect.js');

const { loadServerData, getServer } = require('./src/Components/startup/serverData.js');
const { removeAllNotConnectedServer } = require("./src/Components/startup/serverData.js");
const { setEssentialFolder, EssentialFolder, ensureEssentialFolders } = require("./src/Components/startup/init.js");

const { credential, server, devs_ids = [] } = require("./config.json");

const chalk = require('chalk'); // replace this huge package with picocolors.
const path = require('path');

const { Client, Events, ShardEvents } = require('discord.js');
const client = new Client({ intents: PRESETS.intents });

const queue = new Map();

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) { return; }

  const guilds_settings = await getServer(message.guild.id, message.guild.name);

  const {
    command, searchString, isValidCommand
  } = parseMessageInput(message.content, guilds_settings.prefix);

  if (!isValidCommand) { return; }

  /** @type {import("./src/BasicInfo.js").BasicInfo} */
  const data = {
    guilds_settings: guilds_settings,
    server: {
      host: server.location,
      port: server.port,
      URL: `${server.location}:${server.port}`,
    },
    isDev: devs_ids.includes(message.author.id)
  }

  // execute command
  try { await exec_command(message, data, searchString, queue, command, client); }
  catch (e) { printToTerminal("New ERROR found:", e); }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  return await voiceStateUpdate(oldState, newState, client, queue);
});

client.on(Events.ClientReady, async (event) => {
  console.log("Loading server settings....");
  loadServerData();

  const playlistFolder = path.join(__dirname, "./src/playlistFolder");
  const guildSettingsFolder = path.join(__dirname, "./src/guilds_settings");
  const commandsFolder = path.join(__dirname, "./src/Commands");

  setEssentialFolder(EssentialFolder.PLAYLIST_FOLDER, playlistFolder);
  setEssentialFolder(EssentialFolder.GUILDS_SETTINGS_FOLDER, guildSettingsFolder);
  setEssentialFolder(EssentialFolder.COMMANDS_FOLDER, commandsFolder);

  ensureEssentialFolders();

  // remove all servers that left while bot was offline
  if (!startsAndEndsWith(client.user.username, "<^-^>")) {
    const removedServersIDs = await removeAllNotConnectedServer(client);

    for (let removedServersID of removedServersIDs) {
      if (!(removedServersID === "string")) { console.log(removedServersID); }
      else { console.log(chalk.redBright(`${removedServersID} DELETED`)); }
    }
  }

  console.log("Loaded.");

  await onReady(event, client);
});

client.on(Events.GuildCreate, async (guild) => guildCreate(guild, client));
client.on(Events.GuildDelete, async (guild) => guildDelete(guild, client))
client.on(ShardEvents.Disconnect, async (erMsg, code) => disconnect(client, erMsg, code));
client.on(Events.Error, console.log);

client.login(credential.token);



/**
* @param {String} message
* @param {String} prefix
* @returns
*/
function parseMessageInput(message, prefix) {
  const startsWithPrefix = message.startsWith(prefix);
  const args = message.split(" ");

  return {
    searchString: args.slice(1).join(" "),
    isValidCommand: startsWithPrefix && (message.length > prefix.length),
    command: args[0].substring(prefix.length)
  }
}