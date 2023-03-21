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
  
  const voiceChannel = message.member.voice.channel;
  
  /*----------------------- Get url for video -----------------------*/
  const [
    param,, failed
  ] = await handleRequests.parseSearchString(message, searchString);
  
  if (failed) {
    return message.channel.send(messageInfo.videoNotFoundOrAvailable);
  }
  
  /*--------------------- Get streamable response -------------------*/
  let sentMsg;
  
  const requested = await handleRequests.request(param);
  
  const isPlaylist = requested.type === "playlist";
  
  const playListDownload = requested?.playlist?.every(current => current.isFile);
  const isList = requested.every && requested.every(current => !current.isFile);
  
  const songs = requested.type === "playlist" ? requested.playlist : requested;
  
  if ((isPlaylist && !playListDownload) || isList ) {
    sentMsg = await message.channel.send(messageInfo.videoDownloading);
    
    const paramCopy = Object.assign({}, param);
    const skippedSongs = [];
    
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].isFile) { continue; }
      let idk = JSON.parse(paramCopy.body);
      idk.videoData = songs[i];
      paramCopy.body = JSON.stringify(idk);
      
      const {
        error, comment, isLive, video
      } = await handleRequests.download(paramCopy);
      
      if (error && isPlaylist) {
        skippedSongs.push(messageInfo.skippingDownload(songs[i].title, comment));
        songs.splice(i, 1);
        i--;
      }
      if (error && !isPlaylist) {
        return sentMsg.edit(messageInfo.downloadFailed(songs[i].title , comment));
      }
      
      if (isLive) { songs[i].isLive = true; }
      else { songs[i].duration = video.duration; }
    }
    
    if (skippedSongs.length) {
      message.channel.send(codeBlock(skippedSongs.join("\n")));
    }
    
    sentMsg.edit("💚 Download finish 💚");
  }
  
  const songLoading = await message.channel.send(messageInfo.songLoading);
  
  for (let i = 0; i < songs.length; i++) {
    let shallowCopy = JSON.parse(JSON.stringify(param));
    const temp = JSON.parse(shallowCopy.body);
    temp.videoData = songs[i];
    shallowCopy.body = JSON.stringify(temp);
    shallowCopy.isStream = songs[i].isLive ?? false;
    
    songs[i].getStream = async () => {
      const response = await handleRequests.getRequestSong(shallowCopy);
      
      if (response.error) {
        message.channel.send([
          "Try again!",
          '```js',
          `Encountered error with: ${songs[i].title}`,
          `id: ${songs[i].id} | url: "${songs[i].url}"`,
          `Detail of error: ${response.comment}`,
          '```'
        ].join("\n"));
        
        return response.emptyReadableStream;
      }
      
      return response;
    }
  }
  
  songLoading.delete();
  
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
  
  const audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: "pause" } });
  
  for (let item of songs) {
    const args = {
      video: item,
      voiceChannel: voiceChannel,
      audioPlayer: audioPlayer, 
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