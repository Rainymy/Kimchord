"use strict";
const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { progressBar, makeTextBar } = require('../Components/textProgressBar.js');

function np(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) {
    return message.channel.send('There is nothing playing.');
  }
  
  if (!serverQueue.playing) {
    return message.channel.send('Music is Paused!');
  }
  
  const timeNow = Date.now();
  const startAt = serverQueue.songs[0].time.start;
  const duration = serverQueue.songs[0].duration;
  
  const progressPercent = (timeNow - startAt) / (duration * 1000);
  // const timeLeft = ((startAt + (duration * 1000)) - timeNow) / 1000;
  const timePlayed = (timeNow - startAt) / 1000;
  
  const progress = progressBar(15, progressPercent, "🔥");
  
  const video = serverQueue.songs[0];
  video.description = makeTextBar(timePlayed, duration, progress);
  
  const [ container, embed ] = formatToEmbed(video, message, true);
  
  return message.channel.send(container);
}

module.exports = {
  name: "NP",
  aliases: ["np", "current", "now", "progress"],
  main: np
}