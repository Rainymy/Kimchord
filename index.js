const intents = [
  "GUILDS",
  "GUILD_VOICE_STATES",
  "GUILD_MESSAGES",
  "GUILD_MESSAGE_REACTIONS",
  "DIRECT_MESSAGES",
]

const { Client } = require('discord.js');
const client = new Client({ intents: intents });

const { exec_command } = require('./Components/switch.js');
const {
  prefix,
  credential,
  server,
  devs_ids
} = require("./config.json");

// process.on('unhandledRejection', error => {
//   console.error('Uncaught Promise Rejection', error);
// });

if (!credential?.token) {
  console.error(`Discord token is missing`);
  console.error(`Add 'credential: { token : <token here> }' in config.json file`);
  return;
}

client.login(credential.token);

const queue = new Map();
const devs_id = devs_ids ?? [];

client.on("ready", async () => {
  console.info("---------------------------------");
  console.log(`--- Logged in as ${client.user.tag}! ---`);
  console.info("---------------------------------");
  client.user.setPresence({
    activities: [
      {
        name: `${prefix}help`
      }
    ]
  });
});

client.on("messageCreate", async (message) => {
  if ( message.author.bot ) return;
  
  const args = message.content.split(" ");
  const searchString = args.slice(1).join(' ');
  
  let serverQueue = queue.get(message.guild.id);
  
  if (args[0].startsWith(prefix) && args[0].length > prefix.length) {
    let command = args[0].substring(prefix.length);
    let basic_data = {
      prefix: prefix,
      serverURL: `${server.location}:${server.port}`,
      isDev: devs_id.includes(message.author.id)
    }
    exec_command(message, basic_data, searchString, queue, command, client);
  }
  
  return;
});