function durationToString(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 60 / 60).toString().padStart(2, 0);
  const minutes = Math.floor((durationInSeconds/60) % 60).toString().padStart(2, 0);
  const seconds = Math.round(durationInSeconds % 60).toString().padStart(2, 0);
  
  return `${hours}:${minutes}:${seconds}`;
}

function formatToEmbed(video, requestedBy, noFields=false, songQueue) {
  const image_placeholder = "attachment://placeholder.png";
  const path_placeholder = "./resources/placeholder.png";
  
  const embed = {
  	color: 0x0099ff,
  	title: video.title,
  	url: video.url,
  	description: video.description,
  	thumbnail: {
  		url: video.thumbnail ?? image_placeholder,
  	},
    fields: [],
  	timestamp: new Date(),
  	footer: {
  		text: `Requested by: ${requestedBy.author.username}`,
  		icon_url: requestedBy.author.displayAvatarURL({ dynamic: true }),
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
    const totalQueueLength = songQueue.reduce((acc, curr) => {
      return acc + curr.duration;
    }, 0);
    embed.fields.push({
      name: "Queue",
      value: durationToString(totalQueueLength),
      inline: true
    });
  }
  
  if (video.thumbnail) { return [ { embeds: [ embed ] }, embed ] }
  
  return [ { embeds: [ embed ], files: [ path_placeholder ] }, embed ];
}

module.exports = { formatToEmbed, durationToString: durationToString }