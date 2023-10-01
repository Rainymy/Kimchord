"use strict";
const { createAudioResource } = require('@discordjs/voice');

async function play(guild_id, song, queue) {
  const serverQueue = queue.get(guild_id);
  
  if (!song) { return; }
  
  const player = serverQueue.audioPlayer;
  song.time.start = song.time.last_current ?? Date.now();
  
  const stream = await song.getStream();
  
  const resource = createAudioResource(stream);
  player.play(resource);
  serverQueue.connection.subscribe(player);
  
  return song;
}

module.exports = { player: play }