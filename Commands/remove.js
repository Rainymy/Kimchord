"use strict";
function remove(message, basicInfo, searchString, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue?.songs.length) {
    return message.channel.send(`There is nothing playing 😂`);
  }
  
  const number = parseInt(searchString);
  const minIndex = 0;
  const maxIndex = serverQueue.songs.length - 1;
  
  const isNumber = !isNaN(number);
  const isOverMin = searchString >= minIndex;
  const isOverMax = searchString <= maxIndex;
  
  if ( minIndex === maxIndex) {
    return message.channel.send("Queue is Empty");
  }
  
  if (!isNumber || (!isOverMin || !isOverMax)) {
    return message.channel.send(`Please select number between 1-${ maxIndex }`);
  }
  
  const title = serverQueue.songs[number].title;
  serverQueue.songs.splice( number , 1 );
  message.channel.send(`😩 Remove: ***${title}***`);
  return;
}

module.exports = { name: "Remove", aliases: "remove", main: remove }