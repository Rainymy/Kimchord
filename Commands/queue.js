function queue(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) return message.channel.send('There is nothing playing.');
  message.channel.send(`
      __**Song queue:**__
     ${serverQueue.songs.map((song, index) => 
       ` ${index++} **-** ${song.title}`).join('\n').replace(0,'Current')}
       🎶**Now playing:** ${serverQueue.songs[0].title}`
  );
  return;
}

module.exports = { name: "Queue", aliases: ["q", "queue"], main: queue }