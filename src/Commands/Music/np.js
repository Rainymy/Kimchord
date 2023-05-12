"use strict";
const { formatToEmbed } = require('../../Components/formatToEmbed.js');
const { progressBar, makeTextBar } = require('../../Components/textProgressBar.js');

const { PRESETS } = require('../../Components/permissions.js');
const messageInfo = require('../../Components/messageInfo.js');

async function np(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) { return message.channel.send(messageInfo.nothingPlaying); }
  if (!serverQueue.playing) { return message.channel.send(messageInfo.songPaused); }
  
  if (!serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  if (serverQueue.songs[0].type === "radio") {
    const stationId = serverQueue.songs[0].fmStationID;
    
    const updatedInfo = await serverQueue.songs[0].updateInfo(stationId);
    Object.assign(serverQueue.songs[0], updatedInfo);
  }
  
  const timeNow = Date.now();
  const startAt = serverQueue.songs[0].time.start;
  const timePlayed = (timeNow - startAt) / 1000;
  const duration = serverQueue.songs[0].duration || timePlayed;
  
  const progress = progressBar(15, timePlayed / duration, "🔥");
  
  const video = serverQueue.songs[0];
  video.description = makeTextBar(timePlayed, duration, progress);
  
  const [ container, embed ] = formatToEmbed(video, true);
  
  return message.channel.send(container);
}

module.exports = {
  name: "Now Playing",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: ["np", "now", "progress"],
  main: np
}