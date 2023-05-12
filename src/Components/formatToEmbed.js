"use strict";
const { durationToString } = require('./util.js');

function basicEmbed(video, queueLength) {
  const embedTitle = video.type === "radio"
    ? `📻🎶 Currently jamming to FM Radio 📻🎶`
    : `Song Queue: ${durationToString(queueLength)}`;
  
  const embedDescription = video.type === "radio"
    ? video.title 
    : `Current Song: ${video.title}`;
  
  return {
    title: embedTitle,
    color: 0x0099ff,
    description: embedDescription,
    thumbnail: { url: video.thumbnail },
    fields: []
  }
}

function formatToEmbed(video, noFields=false, songQueue) {
  if (!video) {
    console.trace(`Video value is: ${video}`);
    return [];
  }
  
  const embed = {
  	color: 0x0099ff,
  	title: video.title,
  	url: video.url,
  	description: video.description,
  	thumbnail: { url: video.thumbnail },
    fields: [],
  	timestamp: new Date(),
  	footer: {
  		text: `Requested by: ${video.requestedBy.username}`,
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

module.exports = {
  formatToEmbed: formatToEmbed,
  basicEmbed: basicEmbed
}