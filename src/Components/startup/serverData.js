"use strict";
const path = require('node:path');
const fileHandler = require('../fs/fileHandler.js');
const config = require('../../../config.json');
const { guilds_settings } = require('./init.js').essentialFolders;

const servers = new Map();

function loadServerData() {
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

  return servers;
}

async function removeAllNotConnectedServer(client) {
  const removedServers = [];

  for (let guild_id of getAllServerID()) {
    if (client.guilds.cache.has(guild_id)) { continue; }

    const err = await removeServerData(guild_id);
    removedServers.push(err ? err : guild_id);
  }

  return removedServers;
}

async function removeServerData(guild_id) {
  const pathTo = path.join(__dirname, guilds_settings, `${guild_id}.json`);

  const err = await fileHandler.deleteFile(pathTo);
  if (err) { return err; }

  servers.delete(guild_id);
  return;
}

async function saveDefaultData(server_id, server_name) {
  const default_data = {
    prefix: config.prefix,
    moderation_users: [],
    name: server_name,
    REQUIRE_MUSIC_ROLE: config.REQUIRE_MUSIC_ROLE,
    REQUIRED_MUSIC_ROLE_NAME: config.REQUIRED_MUSIC_ROLE_NAME,
  }

  const saved = await saveServerData(server_id, default_data);
  if (!saved) { return; }

  servers.set(server_id, default_data);

  return saved;
}

async function saveServerData(id, data) {
  if (!id || !data) { return; }

  const pathTo = path.join(__dirname, guilds_settings, `${id}.json`);

  const error = await fileHandler.customWriteStream(pathTo, data);
  if (error) { console.log(error); }

  console.log("Saved.", error === undefined ? "" : error);
  return data;
}

async function getServer(server_id, server_name) {
  let guilds_settings = servers.get(server_id);
  if (!guilds_settings) {
    guilds_settings = await saveDefaultData(server_id, server_name);
  }

  return guilds_settings;
}

function getAllServerID() {
  return servers.keys();
}

module.exports = {
  loadServerData: loadServerData,
  removeAllNotConnectedServer: removeAllNotConnectedServer,
  removeServerData: removeServerData,
  saveServerData: saveServerData,
  saveDefaultData: saveDefaultData,
  getServer: getServer
}
