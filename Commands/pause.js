function pause(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send('There is nothing playing.');
  }
  
  if (!serverQueue.playing) {
    return message.channel.send('Music already paused!');
  }
  
  serverQueue.playing = false;
  serverQueue.audioPlayer.pause();
  serverQueue.songs[0].time.pause = Date.now();
  return; 
}

module.exports = {
  name: "Pause",
  aliases: ["pause", "hold"],
  main: pause
}