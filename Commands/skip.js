function skip(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send('You are not in a voice channel!');
  }
  if (!serverQueue) {
    return message.channel.send(
      'There is nothing playing that I could skip for you.'
    );
  }
  
  serverQueue.audioPlayer.stop();
  message.channel.send("Skipping current song.");
  return;
}

module.exports = { name: "Skip", aliases: "skip", main: skip };