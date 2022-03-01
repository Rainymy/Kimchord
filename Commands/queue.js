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
  
  if (songQueue.length <= itemsPerPage) {
    return message.channel.send({ embeds: [ embed ] });
  }
  
  const embedMessage = await message.channel.send({
    embeds: [ embed ], components: [
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
    
    const newEmbed = createSongListEmbed(songQueue, index, itemsPerPage);
    
    if (songQueue.length <= itemsPerPage) {
      return interaction.update({ embeds: [ newEmbed ] });
    }
    
    interaction.update({
      embeds: [ newEmbed ],
      components: [
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

module.exports = { name: "Queue", aliases: ["q", "queue"], main: queue }