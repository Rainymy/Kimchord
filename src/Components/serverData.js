const path = require('node:path');
const fileHandler = require('./fileHandler.js');
const config = require('../../config.json');
const { guilds_settings } = require('./init.js').essentialFolders;

const servers = new Map();

function loadServerData() {
  console.log("Loading server settings....");
  const pathTo = path.join(__dirname, guilds_settings);
  
  for (let file of fileHandler.readdirSync(pathTo)) {
    let ext = path.extname(file);
    if (ext !== ".json") { continue; }
    let data = fileHandler.readJSONFile(path.join(pathTo, file));
    let shouldUpdate = false;
    
    if (typeof data.REQUIRE_MUSIC_ROLE !== "boolean") {
      shouldUpdate = true;
      data.REQUIRE_MUSIC_ROLE = config.REQUIRE_MUSIC_ROLE;
    }
    
    if (!data.REQUIRED_MUSIC_ROLE_NAME) {
      shouldUpdate = true;
      data.REQUIRED_MUSIC_ROLE_NAME = config.REQUIRED_MUSIC_ROLE_NAME;
    }
    
    if (shouldUpdate) {
      fileHandler.writeFileSync(path.join(pathTo, file), data);
    }
    
    servers.set(path.basename(file, ext), data);
  }
  
  console.log("Loaded.");
  return servers;
}

async function saveDefaultData(server_guilds, message) {
  const default_data = {
    prefix: config.prefix,
    moderation_users: [],
    name: message.guild.name,
    REQUIRE_MUSIC_ROLE: config.REQUIRE_MUSIC_ROLE,
    REQUIRED_MUSIC_ROLE_NAME: config.REQUIRED_MUSIC_ROLE_NAME,
  }
  
  server_guilds.set(message.guild.id, default_data);
  return await saveServerData(message.guild.id, default_data);
}

async function saveServerData(id, data) {
  const pathTo = path.join(__dirname, guilds_settings, `${id}.json`);
  const error = await fileHandler.customWriteStream(pathTo, data);
  if (error) { console.log(error); }
  console.log("Saved.", error === undefined ? "" : error);
  return data; 
}

async function getServer(server_id, message) {
  let guilds_settings = servers.get(server_id);
  if (!guilds_settings) {
    guilds_settings = await saveDefaultData(servers, message);
  }
  
  return guilds_settings;
}

module.exports = {
  loadServerData: loadServerData,
  saveServerData: saveServerData,
  saveDefaultData: saveDefaultData,
  getServer: getServer
}