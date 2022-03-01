const { handleVideo } = require('../Components/handleVideo');
const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { createAudioPlayer } = require('@discordjs/voice');
const request = require('../Components/request.js');
const { checkPermissions, PRESETS } = require('../Components/permissions.js');
const { parseSearchString } = require('../Components/parseSearchString.js');

async function main(message, basicInfo, searchString, queue) {
  if (!searchString.length) {
    return message.channel.send("`<Search text>` or `<Youtube Link>`");
  }
  
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I'm sorry but you need to be in a voice channel to play music!"
    );
  }
  
  /*---------------------- Check for permissions --------------------*/
  const neededPermissions = checkPermissions(voiceChannel, message, PRESETS.music);
  
  for (let [ index, neededPermission ] of neededPermissions.entries()) {
    message.channel.send(
      `I cannot *${neededPermission}*, make sure I have the proper permissions!`
    );
    if (index === neededPermissions.length - 1) { return; }
  }
  
  /*----------------------- Get url for video -----------------------*/
  const baseUrl = basicInfo.serverURL;
  
  const [param,, failed] = await parseSearchString(message, baseUrl, searchString);
  
  if (failed) {
    return message.channel.send(
      "🆘 Video unavailable OR I could not obtain any search results. 🆘"
    );
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
    sentMsg = await message.channel.send("Downloading.... [0s -> 5s]");
    
    const paramCopy = Object.assign({}, param);
    const skippedSongs = [];
    
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].isFile) { continue; }
      let idk = JSON.parse(paramCopy.body);
      idk.videoData = songs[i];
      paramCopy.body = JSON.stringify(idk);
      
      const { error, comment } = await request(`${baseUrl}/download`, paramCopy);
      
      if (error && isPlaylist) {
        skippedSongs.push(`Skipping Download: [${songs[i].title}] : ${comment}`);
        songs.splice(i, 1);
        i--;
      }
      if (error && !isPlaylist) {
        return sentMsg.edit(`Download Failed: [${songs[i].title}] : ${comment}`);
      }
    }
    
    if (skippedSongs.length) {
      message.channel.send(`\`\`\`js\n${skippedSongs.join("\n")}\`\`\``);
    }
    
    sentMsg.edit("💚 Download finish 💚");
  }
  
  const songLoading = await message.channel.send("Song Loading... Wait a moment");
  
  for (let i = 0; i < songs.length; i++) {
    const temp = JSON.parse(param.body);
    temp.videoData = songs[i];
    param.body = JSON.stringify(temp);
  
    const streams = await request(`${baseUrl}/songs`, param);
    
    songs[i].stream = streams.body;
    
    if (streams.error) {
      const sentingTexts = [
        `Service is not available or ERROR! : Index ${i}`,
        streams.comment
      ];
      return songLoading.edit(sentingTexts.join("\n"));
    }
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
      addedSong.description = "✅ has been added to the queue! ✅";
      let [container, embed] = formatToEmbed(addedSong, message, false, songQueue);
      
      message.channel.send(container);
    }
  }
  
  if (isPlaylist) {
    const addPlayList = {
      title: `Playlist: ${requested.title}`,
      description: "🔀 has been added to the queue 🔀",
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

module.exports = { name: "Play", aliases: ["play", "music", "p"], main: main }