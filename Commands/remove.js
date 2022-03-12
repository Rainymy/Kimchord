"use strict";

const messageInfo = require('../Components/messageInfo.js');

function remove(message, basicInfo, searchString, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue?.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  const number = parseInt(searchString);
  const minIndex = 0;
  const maxIndex = serverQueue.songs.length - 1;
  
  const isNumber = !isNaN(number);
  const isOverMin = searchString >= minIndex;
  const isOverMax = searchString <= maxIndex;
  
  if ( minIndex === maxIndex) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }
  
  if (!isNumber || (!isOverMin || !isOverMax)) {
    return message.channel.send(`Please select number between 1-${ maxIndex }`);
  }
  
  const removed = serverQueue.songs.splice( number , 1 )[0];
  message.channel.send(`😩 Remove: ***${removed.title}***`);
  return;
}

module.exports = {
  name: "Remove",
  aliases: "remove",
  category: "music",
  main: remove
}