function remove(message, basicInfo, searchString, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue?.songs.length) {
    return message.channel.send(`There is nothing playing 😂`);
  }
  
  let number = parseInt(searchString);
  let minIndex = 0;
  let maxIndex = serverQueue.songs.length - 1;
  
  let isNumber = !isNaN(number);
  let isOverMin = searchString >= minIndex;
  let isOverMax = searchString <= maxIndex;
  
  if ( minIndex === maxIndex) {
    return message.channel.send("Queue is Empty");
  }
  
  if (!isNumber || (!isOverMin || !isOverMax)) {
    return message.channel.send(`Please select number between 1-${ maxIndex }`);
  }
  
  let title = serverQueue.songs[number].title;
  serverQueue.songs.splice( number , 1 );
  message.channel.send(`😩 Remove: ***${title}***`);
  return;
}

module.exports = { name: "Remove", aliases: "remove", main: remove }