"use strict";
const { PRESETS } = require('../../Components/permissions.js');
const messageInfo = require('../../Components/messageInfo.js');

const {
  handleRequests,
  softCloneRequest,
  modifyRequestBody
} = require('../../Components/handleRequests.js');
const {
  formatToEmbed,
  createAddPlaylistEmbed
} = require('../../Components/formatToEmbed.js');
const {
  addSongsToQueue,
  createPlaylistObject
} = require('../../Components/handleVideo');

async function main(message, basicInfo, searchString, queue) {
  if (!searchString.length) {
    return message.channel.send("`<Search Text>` or `<Youtube Link>`");
  }
  
  /*----------------------- Get url for video -----------------------*/
  const [
    param,, failed
  ] = await handleRequests.parseSearchString(message, searchString);
  
  if (typeof failed === "string") { return message.channel.send(failed); }
  if (failed) { return message.channel.send(messageInfo.videoNotFoundOrAvailable); }
  
  /*--------------------- Get streamable response -------------------*/
  const requested = await handleRequests.request(param);
  if (requested.error) {
    return message.channel.send("Internal error");
  }
  
  const songs = requested.type === "playlist" ? requested.playlist : requested;
  
  for (let i = 0; i < songs.length; i++) {
    const newParam = modifyRequestBody(softCloneRequest(param), songs[i]);
    
    songs[i].getStream = async () => {
      const loading = await message.channel.send("Song Loading...");
      const response = await handleRequests.getRequestSong(newParam);
      loading.delete();
      
      if (response.error) {
        message.channel.send(messageInfo.errorStreamDetail(response.comment));
        return response.emptyReadableStream;
      }
      
      return response;
    }
    
    songs[i].requestDelete = async () => {
      console.log("requested for delete");
    }
  }
  
  /*--------------- Check for connected voicechannel ----------------*/
  if (!message.member.voice.channel) { return; }
  
  /*--------- Add the playable stream to queue and play it ---------*/
  const [ addedSong, songQueue ] = addSongsToQueue(message, songs, queue);
  
  if (requested.type === "playlist") {
    requested.description = messageInfo.playlistAddedToQueue
    const addPlayList = createPlaylistObject(requested, message.author);
    let [ container, embed ] = createAddPlaylistEmbed(addPlayList);
    
    return message.channel.send(container).catch(err => {
      console.log("Caught Error in playlist: ", err);
    });
  }
  
  if (addedSong && songQueue?.length > 1) {
    addedSong.description = messageInfo.songAddedToQueue;
    let [ container, embed ] = formatToEmbed(addedSong, false, songQueue);
    
    return message.channel.send(container).catch(err => {
      console.log("Caught Error in play: ", err);
    });
  }
  
  return;
}

module.exports = {
  name: "Play",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.MUSIC,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: ["play", "music", "p"],
  main: main
}