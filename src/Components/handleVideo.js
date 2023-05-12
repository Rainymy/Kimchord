"use strict";
const { createConnection } = require('./handleConnection.js');
const { addEventListener } = require('./eventListener.js');
const { player } = require('../Components/player.js');
const { TIMNEOUT_DURATION_MS } = require('../../config.json');

function handleVideo(args) {
  const { video, voiceChannel, audioPlayer, queue, guild } = args;
  const serverQueue = queue.get(guild.channel.guild.id);
  
  let song = {
    id: video.id,
    type: video.type,
    title: video.title,
    url: video.url,
    duration: video.duration,
    thumbnail: video.thumbnail,
    requestedBy: guild.author,
    time: {
      requestedAt: Date.now(),
      start: null,
      pause: null
    },
    stream: video.stream,
    getStream: null,
    requestDelete: null,
    ...video
  }
  
  if (serverQueue) {
    if (serverQueue.timeout.id === null) {
      serverQueue.songs.push(song);
      return [ song, serverQueue.songs ];
    }
    
    clearTimeout(serverQueue.timeout.id);
    
    serverQueue.timeout.id = null;
    serverQueue.songs.push(song);
    
    player(guild.channel.guild.id, song, queue);
    return [ song, serverQueue.songs ];
  }
  
  const queueConstruct = {
    textChannel: guild.channel,
    voiceChannel: voiceChannel,
    audioPlayer: audioPlayer,
    connection: createConnection(voiceChannel),
    songs: [],
    playing: true,
    timeout: { id: null, duration: TIMNEOUT_DURATION_MS }
  }
  
  queue.set(guild.channel.guild.id, queueConstruct);
  
  queueConstruct.songs.push(song);
  
  addEventListener(queueConstruct, queue, player);
  player(guild.channel.guild.id, song, queue);
  
  return [];
}

module.exports = { handleVideo }