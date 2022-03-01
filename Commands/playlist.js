const path = require('path');
const playMusic = require("./play.js").main;

const {
  getBasicInfo,
  getPlaylistId
} = require('../Components/youtubeMetadata.js');
const {
  customReadStream,
  customWriteStream
} = require('../Components/fileHandler.js');

const playlistFolder = "../playlistFolder";

async function addPlayList(searchString, userId) {
  const userFile = path.join(__dirname, playlistFolder, `${userId}.json`);
  
  const playlistId = getPlaylistId(searchString);
  if (!playlistId) {
    return { error: true, comment: "Please use the playlist link! from Youtube." }
  }
  
  const data = await customReadStream(userFile);
  
  if (!data[playlistId]) {
    const response = await getBasicInfo(searchString);
    
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
  const userFile = path.join(__dirname, playlistFolder, `${userId}.json`);
  
  const data = await customReadStream(userFile);
  
  let playlistId;
  
  if (data.titles[searchString]?.id) {
    playlistId = data.titles[searchString].id;
  }
  else {
    playlistId = getPlaylistId(searchString);
  }
  
  if (!playlistId) {
    return { error: true, comment: `${searchString} playlist not found.` }
  }
  
  if (data[playlistId]) {
    return { error: false, playURL: data[playlistId].url }
  }
  
  return { error: true, comment: "Playlist doesn't exists!" };
  
  return;
}

async function listPlayList(searchString, userId) {
  const userFile = path.join(__dirname, playlistFolder, `${userId}.json`);
  
  const data = await customReadStream(userFile);
  return { error: false, comment: "Successful", list: data };
}

async function removePlayList(searchString, userId) {
  const userFile = path.join(__dirname, playlistFolder, `${userId}.json`);
  
  const data = await customReadStream(userFile);
  
  let playlistId;
  
  if (data.titles[searchString]?.id) {
    playlistId = data.titles[searchString].id;
  }
  else {
    playlistId = getPlaylistId(searchString);
  }
  
  if (!playlistId) {
    return { error: true, comment: `${searchString} playlist not found.` }
  }
  
  if (data[playlistId]) {
    delete data.titles[data[playlistId].title];
    delete data[playlistId];
    
    // return { error: false, comment: "TEsting Mode" }
    
    const hasError = await customWriteStream(userFile, data);
    if (hasError) { return { error: true, comment: hasError } }
    
    return { error: false, comment: "Successfully removed." }
  }
  
  return { error: true, comment: "Playlist doesn't exists!" };
  
  return;
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

async function playlist(message, basicInfo, arg, queue) {
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
  if (result.error) {
    return message.channel.send(`ERROR: ${result.comment}`);
  }
  
  if (result.playURL) {
    return playMusic(message, basicInfo, result.playURL, queue);
  }
  
  if (result.list) {
    const container = ["Playlists"];
    
    for (let list in result.list.titles) {
      const playlistID = result.list.titles[list].id
      container.push(`${container.length}. ${result.list[playlistID].title}`);
    }
    
    return message.channel.send(container.join("\n"));
  }
  return message.channel.send(`${result.comment}`);
}

module.exports = {
  name: "Playlist",
  aliases: ["playlist"],
  main: playlist
}