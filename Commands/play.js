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
  let neededPermissions = checkPermissions(
    voiceChannel, message, PRESETS.music
  );
  
  for (let [ index, neededPermission ] of neededPermissions.entries()) {
    message.channel.send(
      `I cannot *${neededPermission}*, make sure I have the proper permissions!`
    );
    if (index === neededPermissions.length - 1) { return; }
  }
  
  /*----------------------- Get url for video -----------------------*/
  const baseUrl = basicInfo.serverURL;
  
  const [
    param, video, failed
  ] = await parseSearchString(message, baseUrl, searchString);
  
  if (failed) {
    message.channel.send('Video unavailable OR');
    return message.channel.send('🆘 I could not obtain any search results. 🆘');
  }
  
  /*--------------------- Get streamable response -------------------*/
  const { isFile, comment } = await request(`${baseUrl}/request`, param);
  const sentMsg = await message.channel.send(comment);
  
  let res;
  
  if (!isFile) {
    sentMsg.edit("Downloading.... [0s -> 5s]");
    
    const {error:noSuccess, comment} = await request(`${baseUrl}/download`, param);
    if (noSuccess) { return sentMsg.edit(`Download FAILED 🤦‍♂️: ${comment}`); }
    
    sentMsg.edit("💚 Download finish 💚");
  }
  
  res = await request(`${baseUrl}/songs`, param);
  if (!res.ok) {
    return message.channel.send("Service is not available or ERROR!");
  }
  
  const { duration, error } = await request(`${baseUrl}/getDuration`, param);
  if (error) { return sentMsg.edit(`Get Duration FAILED 🤦: ${error}`); }
  video.duration = duration;
  
  /*-----------------------------------------------------------------*/
  
  const audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: "pause"} });
  
  const args = {
    video,
    voiceChannel,
    audioPlayer, 
    queue,
    guild: {
      channel: message.channel,
      author: message.author
    },
    stream: res.body
  }
  
  const [ addedSong, songQueue ] = handleVideo(args);
  if (addedSong) {
    addedSong.description = "✅ has been added to the queue! ✅";
    let [container, embed] = formatToEmbed(addedSong, message, false, songQueue);
    
    message.channel.send(container);
  }
  
  return;
}

module.exports = { name: "Play", aliases: ["play", "music", "p"], main: main }