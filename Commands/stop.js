function stop(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send('You are not in a voice channel!');
  }
  
  if (!serverQueue) {
    return message.channel.send(
      'There is nothing playing that I could stop for you.'
    );
  }
  
  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  queue.delete(message.guild.id);
  return;
}

module.exports = {
  name: "Stop",
  aliases: ["stop", "leave"],
  category: "music",
  main: stop
};