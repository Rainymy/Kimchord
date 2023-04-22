"use strict";
const { handleVideo } = require('../../Components/handleVideo');
const { formatToEmbed } = require('../../Components/formatToEmbed.js');
const { PRESETS } = require('../../Components/permissions.js');
const handleRequests = require('../../Components/handleRequests.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

const { createAudioPlayer } = require('@discordjs/voice');

async function main(message, basicInfo, searchString, queue, client) {
  if (!searchString.length) {
    return message.channel.send("`<Search Text>` or `<Youtube Link>`");
  }
  
  /*----------------------- Get url for video -----------------------*/
  const [
    param,, failed
  ] = await handleRequests.parseSearchString(message, searchString);
  
  if (failed) {
    return message.channel.send(messageInfo.videoNotFoundOrAvailable);
  }
  
  /*--------------------- Get streamable response -------------------*/
  const requested = await handleRequests.request(param);
  
  if (requested.error) {
    return message.channel.send("Internal error");
  }
  
  const songs = requested.type === "playlist" ? requested.playlist : requested;
  
  for (let i = 0; i < songs.length; i++) {
    let shallowCopy = JSON.parse(JSON.stringify(param));
    const temp = JSON.parse(shallowCopy.body);
    temp.videoData = songs[i];
    shallowCopy.body = JSON.stringify(temp);
    shallowCopy.isStream = songs[i].isLive ?? false;
    
    songs[i].getStream = async () => {
      const response = await handleRequests.getRequestSong(shallowCopy);
      
      if (response.error) {
        message.channel.send(
          codeBlock(`Detail of error: [ ${response.comment} ]`, "js")
        );
        
        return response.emptyReadableStream;
      }
      
      return response;
    }
  }
  
  const isPlaylist = requested.type === "playlist";
  
  if (!isPlaylist) {
    const temp_1 = JSON.parse(param.body);
    temp_1.videoData = JSON.parse(JSON.stringify(songs));
    param.body = JSON.stringify(temp_1);
    
    const durations = await handleRequests.getDuration(param);
    
    for (let i = 0; i < requested.length; i++) {
      requested[i].duration = durations[i];
    }
  }
  
  /*--------- Add the playable stream to queue and play it ---------*/
  for (let item of songs) {
    const args = {
      video: item,
      voiceChannel: message.member.voice.channel,
      audioPlayer: createAudioPlayer({ behaviors: { noSubscriber: "pause" } }), 
      queue: queue,
      guild: {
        channel: message.channel,
        author: message.author
      }
    }
    
    const [ addedSong, songQueue ] = handleVideo(args);
    
    if (!isPlaylist && (addedSong && !(addedSong && songQueue?.length === 1))) {
      addedSong.description = messageInfo.songAddedToQueue;
      let [ container, embed ] = formatToEmbed(addedSong, false, songQueue);
      
      await message.channel.send(container).catch(err => {
        console.log("Caught Error in play: ", err);
      });
    }
  }
  
  if (isPlaylist) {
    const addPlayList = {
      title: `Playlist: ${requested.title}`,
      description: messageInfo.playlistAddedToQueue,
      url: requested.playlistURL,
      thumbnail: requested.thumbnail,
      duration: requested.playlist.reduce((acc, curr) => acc + curr.duration, 0),
      requestedBy: message.author
    }
    
    console.log(addPlayList);
    
    let [ container, embed ] = formatToEmbed(addPlayList, false);
    
    await message.channel.send(container).catch(err => {
      console.log("Caught Error in playlist: ", err);
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