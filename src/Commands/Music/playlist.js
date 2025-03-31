"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const path = require('node:path');
const playMusic = require("./play.js").main;
const { playlistFolder } = require('../../Components/startup/init.js').essentialFolders;

const { getBasicInfo, getPlaylistId } = require('../../Components/util/youtubeMetadata.js');
const { customReadStream, customWriteStream } = require('../../Components/fs/fileHandler.js');

async function addPlayList(searchString, userId) {
  if (!searchString) { return { error: true, comment: "Link/Text" } }

  const userFile = path.join(__dirname, "..", playlistFolder, `${userId}.json`);

  const playlistId = getPlaylistId(searchString);
  if (!playlistId) {
    return { error: true, comment: "Please use the playlist link! from Youtube." }
  }

  const data = await customReadStream(userFile);

  if (!data[playlistId]) {
    const response = await getBasicInfo(searchString);
    if (!response) {
      return { error: false, comment: "Playlist either private or unlisted" }
    }

    if (!data.titles) { data.titles = {}; }

    data.titles[response.title] = { id: playlistId };

    data[playlistId] = {
      title: response.title,
      thumbnail: response.thumbnail_url,
      id: playlistId,
      url: searchString
    }

    const hasError = await customWriteStream(userFile, data);
    if (hasError) { return { error: true, comment: hasError } }

    return { error: false, comment: "Successfully added" }
  }

  return { error: true, comment: "Playlist already exists!" };
}

async function playPlayList(searchString, userId) {
  if (!searchString) { return { error: true, comment: "Link/Text" } }

  const userFile = path.join(__dirname, "..", playlistFolder, `${userId}.json`);

  const data = await customReadStream(userFile);
  let playlistId;

  if (!data?.titles?.[searchString]?.id) { playlistId = getPlaylistId(searchString); }
  else { playlistId = data.titles[searchString].id; }

  if (!playlistId) {
    return { error: true, comment: `${searchString} playlist not found.` }
  }

  if (data[playlistId]) { return { error: false, playURL: data[playlistId].url } }

  return { error: true, comment: "Playlist doesn't exist!" };
}

async function listPlayList(searchString, userId) {
  const userFile = path.join(__dirname, "..", playlistFolder, `${userId}.json`);

  const data = await customReadStream(userFile);
  return { error: false, comment: "Successful", list: data };
}

async function removePlayList(searchString, userId) {
  if (!searchString) { return { error: true, comment: "Link/Text" } }

  const userFile = path.join(__dirname, "..", playlistFolder, `${userId}.json`);

  const data = await customReadStream(userFile);
  let playlistId;

  if (data?.titles?.[searchString]?.id) { playlistId = getPlaylistId(searchString); }
  else { playlistId = data.titles[searchString].id; }

  if (!playlistId) {
    return { error: true, comment: `${searchString} playlist not found.` }
  }

  if (data[playlistId]) {
    delete data.titles[data[playlistId].title];
    delete data[playlistId];

    const hasError = await customWriteStream(userFile, data);
    if (hasError) { return { error: true, comment: hasError } }

    return { error: false, comment: "Successfully removed." }
  }

  return { error: true, comment: "Playlist doesn't exist!" };
}

function renamePlayList(searchString, userId) {
  return { error: true, comment: "Not supported yet!" };
}

const commands = {
  add: { main: addPlayList },
  play: { main: playPlayList },
  list: { main: listPlayList },
  remove: { main: removePlayList },
  rename: { main: renamePlayList },
}

async function playlist(message, basicInfo, arg, queue, client) {
  let serverQueue = queue.get(message.guild.id);

  const command = arg.split(" ");
  const userCommand = command.shift();
  const searchString = command.join(" ");

  if (!commands[userCommand]) {
    return message.channel.send(
      `Supported commands: **add, play, list, remove, rename**`
    );
  }

  const result = await commands[userCommand].main(searchString, message.author.id);
  if (result.error) { return message.channel.send(`ERROR: ${result.comment}`); }

  if (result.playURL) {
    return playMusic(message, basicInfo, result.playURL, queue, client);
  }

  if (result.list) {
    const container = ["Playlists"];

    for (let list in result.list.titles) {
      const playlistID = result.list.titles[list].id;
      container.push(`${container.length}. ${result.list[playlistID].title}`);
    }

    return message.channel.send(container.join("\n"));
  }

  return message.channel.send(`${result.comment}`);
}

/** @type {import("../CommandModule.js").CommandModule} */
const command = {
  name: "Playlist",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: ["playlist"],
  main: playlist
}

module.exports = command;