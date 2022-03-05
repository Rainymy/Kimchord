const {
  createSongListEmbed,
  createButton,
  createPageIndicator
} = require('../Components/discordComponents.js');

async function queue(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) return message.channel.send('There is nothing playing.');
  
  const backButton = createButton("Back", "back_button", false, "◀️");
  const nextButton = createButton("Next", "next_button", false, "▶️");
  
  let index = 0;
  const itemsPerPage = 5;
  const songQueue = serverQueue.songs;
  
  const embed = createSongListEmbed(songQueue, index, itemsPerPage);
  
  const radio_image = "attachment://radio.png";
  const radio_path = "./resources/radio.png";
  let default_path = [];
  
  if (songQueue[0].type === "radio" && !songQueue[0].thumbnail) {
    default_path  = [ radio_path ];
  }
  
  if (!embed.thumbnail.url) { embed.thumbnail.url = radio_image; }
  
  if (songQueue.length - 1 <= itemsPerPage) {
    return message.channel.send({
      files: [ ...default_path ], embeds: [ embed ]
    });
  }
  
  const embedMessage = await message.channel.send({
    files: [ ...default_path ], embeds: [ embed ], components: [
      {
        type: "ACTION_ROW",
        components: [
          nextButton,
          ...createPageIndicator(songQueue.length, index, itemsPerPage)
        ]
      }
    ]
  });
  
  const collector = embedMessage.createMessageComponentCollector({
    time: 60 * 60 * 1000
  });
  
  collector.on("collect", async interaction => {
    index -= interaction.customId === "back_button" ? itemsPerPage : -itemsPerPage;
    
    let newEmbed = createSongListEmbed(songQueue, index, itemsPerPage);
    
    if (!newEmbed.fields.length) {
      index -= itemsPerPage;
      newEmbed = createSongListEmbed(songQueue, index, itemsPerPage);
    }
    
    if (songQueue[0].type === "radio" && !newEmbed.thumbnail.url) {
      newEmbed.thumbnail.url = radio_image;
      default_path = [ radio_path ];
    }
    
    if (songQueue.length - 1 <= itemsPerPage) {
      return interaction.update({
        files: [ ...default_path ], embeds: [ newEmbed ], components: []
      });
    }
    
    interaction.update({
      files: [ ...default_path ], embeds: [ newEmbed ], components: [
        {
          type: "ACTION_ROW",
          components: [
            ...(index ? [backButton] : []),
            ...(
              (index + itemsPerPage) < songQueue.length ? [nextButton] : []
            ),
            ...createPageIndicator(songQueue.length, index, itemsPerPage)
          ]
        }
      ]
    });
    
    return;
  });
  
  collector.on('end', collected => {
    embedMessage.edit("Song queue timer run out");
  });
  
  return;
}

module.exports = {
  name: "Queue",
  aliases: ["q", "queue"],
  category: "music",
  main: queue
}