"use strict";
const { durationToString } = require('../util/timeUtil.js');
const { codeBlock } = require('./markup.js');
const EMBED_COLOR = 0x0099ff;

function basicEmbed(video, queueLength) {
  const embedTitle = video.type === "radio"
    ? `📻🎶 Currently jamming to FM Radio 📻🎶`
    : `Song Queue: ${durationToString(queueLength)}`;

  const embedDescription = video.type === "radio"
    ? video.title
    : `Current Song: ${video.title}`;

  return {
    title: embedTitle,
    color: video.color ?? EMBED_COLOR,
    description: embedDescription,
    thumbnail: { url: video.thumbnail },
    fields: []
  }
}

function createAvatarEmbed(message, target) {
  if (!target) { target = message; }

  return {
    color: EMBED_COLOR,
    title: `${target.globalName}'s Avatar`,
    image: { url: target.displayAvatarURL({ dynamic: true, size: 1024 }) },
    footer: {
      text: `Requested by: ${message.globalName}`,
      icon_url: `${message.displayAvatarURL({ dynamic: true })}`
    }
  }
}

function formatToEmbed(video, noFields=false, songQueue) {
  if (!video) {
    console.trace(`Video value is: ${video}`);
    return [];
  }

  const embed = {
  	title: video.title,
    color: video.color ?? EMBED_COLOR,
  	url: video.url,
  	description: video.description,
  	thumbnail: { url: video.thumbnail },
    fields: [],
  	timestamp: new Date(),
  	footer: {
  		text: `Requested by: ${video.requestedBy.globalName}`,
  		icon_url: video.requestedBy.displayAvatarURL({ dynamic: true }),
  	},
  }

  if (!noFields) {
    embed.fields.push({
      name: "Duration",
      value: durationToString(video.duration),
      inline: true
    });
  }

  if (songQueue) {
    const totalQueueLength = songQueue.reduce((acc, cur) => acc + cur.duration, 0);
    embed.fields.push({
      name: "Queue",
      value: durationToString(totalQueueLength),
      inline: true
    });
  }

  return [ { embeds: [ embed ] }, embed ];
}

function createAddPlaylistEmbed(playlist) {
  const itemCount = `${playlist.data.itemCount} Videos`;
  const viewCount = `${playlist.data.viewCount} Views`;

  const embed = {
    title: playlist.title,
    color: playlist.color ?? EMBED_COLOR,
    url: playlist.url,
    description: playlist.description,
    thumbnail: { url: playlist.thumbnail },
    fields: [
      {
        name: "Duration",
        value: durationToString(playlist.duration),
        inline: true
      },
      // a padding to separate more
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: "Info",
        value: `[ ${itemCount} - ${viewCount} ]`,
        inline: true
      },
    ],
    timestamp: new Date(),
    footer: {
  		text: `Requested by: ${playlist.requestedBy.globalName}`,
  		icon_url: playlist.requestedBy.displayAvatarURL({ dynamic: true }),
  	},
  }

  return [ { embeds: [ embed ] }, embed ];
}

module.exports = {
  basicEmbed: basicEmbed,
  createAvatarEmbed: createAvatarEmbed,
  formatToEmbed: formatToEmbed,
  createAddPlaylistEmbed: createAddPlaylistEmbed
}
