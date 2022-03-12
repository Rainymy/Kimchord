const { handleVideo } = require('../Components/handleVideo');
const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { createAudioPlayer } = require('@discordjs/voice');
const request = require('../Components/request.js');
const { checkPermissions, PRESETS } = require('../Components/permissions.js');
const { parseSearchString } = require('../Components/parseSearchString.js');
const { codeBlock } = require('../Components/markup.js');
const messageInfo = require('../Components/messageInfo.js');

async function main(message, basicInfo, searchString, queue, client) {
  if (!searchString.length) {
    return message.channel.send("`<Search text>` or `<Youtube Link>`");
  }
  
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  /*---------------------- Check for permissions --------------------*/
  const neededPermissions = checkPermissions(
    voiceChannel, client.user.id, PRESETS.music
  );
  
  for (let [ index, neededPermission ] of neededPermissions.entries()) {
    message.channel.send(messageInfo.permissionNeeded(neededPermission));
    if (index === neededPermissions.length - 1) { return; }
  }
  
  /*----------------------- Get url for video -----------------------*/
  const baseUrl = basicInfo.serverURL;
  
  const [param,, failed] = await parseSearchString(message, baseUrl, searchString);
  
  if (failed) {
    return message.channel.send(messageInfo.videoNotFoundOrAvailable);
  }
  
  /*--------------------- Get streamable response -------------------*/
  let sentMsg;
  
  const requested = await request(`${baseUrl}/request`, param);
  const requestClone = JSON.parse(JSON.stringify(requested));
  
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
      
      const { error, comment } = await request(`${baseUrl}/download`, paramCopy);
      
      if (error && isPlaylist) {
        skippedSongs.push(messageInfo.skippingDownload(songs[i].title, comment));
        songs.splice(i, 1);
        i--;
      }
      if (error && !isPlaylist) {
        return sentMsg.edit(messageInfo.downloadFailed(songs[i].title ,comment));
      }
    }
    
    if (skippedSongs.length) {
      message.channel.send(codeBlock(skippedSongs.join("\n")));
    }
    
    sentMsg.edit("💚 Download finish 💚");
  }
  
  const songLoading = await message.channel.send(messageInfo.songLoading);
  
  for (let i = 0; i < songs.length; i++) {
    const temp = JSON.parse(param.body);
    temp.videoData = songs[i];
    param.body = JSON.stringify(temp);
    
    const streams = request(`${baseUrl}/songs`, param);
    
    songs[i].stream = streams;
  }
  
  songLoading.delete();
  
  if (!isPlaylist) {
    const temp_1 = JSON.parse(param.body);
    temp_1.videoData = requestClone;
    param.body = JSON.stringify(temp_1);
    
    const durations = await request(`${baseUrl}/getDuration`, param);
    
    for (let i = 0; i < requested.length; i++) {
      requested[i].duration = durations[i];
    }
  }
  
  /*-----------------------------------------------------------------*/
  
  const audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: "pause"} });
  
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
    
    if (!isPlaylist && addedSong) {
      addedSong.description = messageInfo.songAddedToQueue;
      let [container, embed] = formatToEmbed(addedSong, message, false, songQueue);
      
      message.channel.send(container);
    }
  }
  
  if (isPlaylist) {
    const addPlayList = {
      title: `Playlist: ${requested.title}`,
      description: messageInfo.playlistAddedToQueue,
      url: requested.playlistURL,
      thumbnail: requested.thumbnail,
      duration: requested.playlist.reduce((acc, curr) => acc + curr.duration, 0)
    }
    
    console.log(addPlayList);
    
    let [ container, embed ] = formatToEmbed(addPlayList, message, false);
    
    message.channel.send(container);
  }
  
  return;
}

module.exports = {
  name: "Play",
  aliases: ["play", "music", "p"],
  category: "music",
  main: main
}