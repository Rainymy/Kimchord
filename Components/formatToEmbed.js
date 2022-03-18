const { durationToString } = require('./util.js');

function formatToEmbed(video, noFields=false, songQueue) {
  const placeholder_image = "attachment://placeholder.png";
  const placeholder_path = "./resources/placeholder.png";
  
  const radio_image = "attachment://radio.png";
  const radio_path = "./resources/radio.png";
  
  const default_image = video.type === "radio" ? radio_image: placeholder_image;
  const default_path = video.type === "radio" ? radio_path: placeholder_path;
  
  const embed = {
  	color: 0x0099ff,
  	title: video.title,
  	url: video.url,
  	description: video.description,
  	thumbnail: { url: video.thumbnail ?? default_image },
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
  
  if (video.thumbnail) { return [ { embeds: [ embed ] }, embed ] }
  
  return [ { embeds: [ embed ], files: [ default_path ] }, embed ];
}

module.exports = { formatToEmbed }