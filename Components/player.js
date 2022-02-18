const { createAudioResource } = require('@discordjs/voice');

function play(guild_id, song, queue) {
  const serverQueue = queue.get(guild_id);
  
  if (!song) { return; }
  
  const player = serverQueue.audioPlayer;
  song.time.start = Date.now();
  
  const resource = createAudioResource(song.stream);
  player.play(resource);
  serverQueue.connection.subscribe(player);
  
  return song;
}

module.exports = { player: play }