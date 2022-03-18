"use strict";

const { validatePermissions, PRESETS } = require('./Components/permissions.js');
const { exec_command } = require('./Components/switch.js');
const { prefix, credential, server, devs_ids } = require("./config.json");

const { Client, DiscordAPIError, Constants } = require('discord.js');
const client = new Client({ intents: PRESETS.intents });

if (!credential?.token) {
  console.error(`Discord token is missing`);
  console.error(`Add 'credential: { token : <token here> }' in config.json file`);
  return;
}

client.login(credential.token);

const queue = new Map();
const devs_id_list = devs_ids ?? [];
const showServerCount = true;

function updateActivity(client) {
  if (!showServerCount) { return client.user.setActivity( `${prefix}help` ); }
  return client.user.setActivity(
    `${prefix}help [Serving ${client.guilds.cache.size} servers]`
  );
}

client.on("ready", async (event) => {
  console.info("---------------------------------");
  console.log(`--- Logged in as ${client.user.tag}! ---`);
  console.info("---------------------------------");
  
  updateActivity(client);
});

client.on("messageCreate", async (message) => {
  if ( message.author.bot ) return;
  
  const validation = validatePermissions(
    message.channel, client.user.id, PRESETS.channel
  );
  
  if (validation.stop) { return; }
  if (validation.error) { return message.channel.send(validation.comment); }
  
  const args = message.content.split(" ");
  const searchString = args.slice(1).join(' ');
  
  if (args[0].startsWith(prefix) && args[0].length > prefix.length) {
    let command = args[0].substring(prefix.length);
    let basic_data = {
      prefix: prefix,
      serverHost: server.location,
      serverPort: server.port,
      serverURL: `${server.location}:${server.port}`,
      isDev: devs_id_list.includes(message.author.id)
    }
    
    try {
      await exec_command(
        message, basic_data, searchString, queue, command, client
      );
    }
    catch (e) {
      if (e.code === Constants.APIErrors.MISSING_PERMISSIONS) {
        return console.log("Has Timeout or MISSING_PERMISSIONS");
      }
      console.log("New ERROR found: ", e);
    }
  }
  
  return;
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState?.guild?.name) { console.log(oldState.guild.name); }
  
  if (!oldState?.channelId) { return; }
  if (newState.id !== client.user.id) { return };
  if (newState.channelId === oldState.channelId) { return; }
  
  const serverQueue = queue.get(oldState.guild.id);
  if (!serverQueue) { return; }
  
  serverQueue.textChannel.send(
    `${client.user.username} disconnected by user action 😔`
  )
  .catch(e => {
    if (e.code === Constants.APIErrors.MISSING_ACCESS) {
      return console.log("Kicked from server or MISSING_ACCESS");
    }
    console.log('ERROR from "voiceStateUpdate"', e.code); 
  });
  
  serverQueue.connection.destroy();
  
  return queue.delete(oldState.guild.id);
});

client.on('guildCreate', async (guild) => {
  console.log("Joined a server YEAY");
  updateActivity(client);
});

client.on("guildDelete", async (guild) => {
  console.log("Left from server so Sad");
  updateActivity(client);
})

client.on('disconnect', async (erMsg, code) => {
  console.log("Disconnect CODE: ", code);
  console.log("ERROR MESSAGE From disconnect: ", erMsg);
  client.connect();
});