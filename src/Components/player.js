const { createAudioResource } = require('@discordjs/voice');

async function play(guild_id, song, queue) {
  const serverQueue = queue.get(guild_id);
  
  if (!song) { return; }
  
  const player = serverQueue.audioPlayer;
  song.time.start = Date.now();
  
  const stream = await song.stream;
  
  if (stream.error) {
    serverQueue?.audioPlayer?.stop();
    return serverQueue.textChannel.send([
      '```js',
      `Encountered error with: ${song.title}`,
      `id: ${song.id} | url: "${song.url}"`,
      `Detail of error: ${stream.comment}`,
      '```'
    ].join("\n"));
  }
  
  const resource = createAudioResource(stream);
  player.play(resource);
  serverQueue.connection.subscribe(player);
  
  return song;
}

module.exports = { player: play }