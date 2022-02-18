function resume(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send('There is nothing playing.');
  }
  
  if (serverQueue.playing) {
    return message.channel.send('Music is playing!');
  }
  
  serverQueue.playing = true; 
  serverQueue.audioPlayer.unpause();
  
  const pausedTime = serverQueue.songs[0].time.pause;
  const pausedDuration = Date.now() - pausedTime;
  serverQueue.songs[0].time.start += pausedDuration;
  
  return;
}

module.exports = {
  name: "Resume",
  aliases: ["resume", "continue"],
  main: resume
}