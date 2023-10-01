"use strict";
const { createConnection } = require('./handleConnection.js');
const { addEventListener } = require('./eventListener.js');
const { player } = require('./player.js');
const { TIMNEOUT_DURATION_MS } = require('../../../config.json');

const { createAudioPlayer } = require('@discordjs/voice');

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
      last_current: null,
      start: null,
      pause: null
    },
    streamModification: {
      isSkipping: false,
      isSkipRelative: null,
      skip: 0
    },
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

function addSongsToQueue(message, songs, queue) {
  let data;

  for (let item of songs) {
    const args = {
      video: item,
      voiceChannel: message.member.voice.channel,
      audioPlayer: createAudioPlayer({ behaviors: { noSubscriber: "pause" } }),
      queue: queue,
      guild: {
        channel: message.channel,
        author: message.author
      }
    }

    data = handleVideo(args);
  }

  return data ?? [];
}

function createPlaylistObject(meta, author) {
  return {
    title: `Playlist: ${meta.title}`,
    description: meta.description,
    url: meta.playlistURL,
    thumbnail: meta.thumbnail,
    data: {
      itemCount: meta.itemCount,
      viewCount: meta.views,
    },
    duration: meta.playlist.reduce((acc, curr) => acc + curr.duration, 0),
    requestedBy: author
  }
}

module.exports = {
  addSongsToQueue: addSongsToQueue,
  handleVideo: handleVideo,
  createPlaylistObject: createPlaylistObject
}
