"use strict";
const { createAudioResource } = require('@discordjs/voice');
const { Readable } = require('node:stream');

function createEmptyReadableStream() {
  const emptyStream = new Readable();
  emptyStream.push("");
  emptyStream.push(null);
  
  return emptyStream;
}

async function play(guild_id, song, queue) {
  const serverQueue = queue.get(guild_id);
  
  if (!song) { return; }
  
  const player = serverQueue.audioPlayer;
  song.time.start = Date.now();
  
  let stream = await song.stream;
  
  if (stream.error) {
    await serverQueue.textChannel.send([
      "Try again!",
      '```js',
      `Encountered error with: ${song.title}`,
      `id: ${song.id} | url: "${song.url}"`,
      `Detail of error: ${stream.comment}`,
      '```'
    ].join("\n"));
    
    stream = createEmptyReadableStream();
  }
  
  const resource = createAudioResource(stream);
  player.play(resource);
  serverQueue.connection.subscribe(player);
  
  return song;
}

module.exports = { player: play }