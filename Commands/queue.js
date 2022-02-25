function createEmbed(songs, start, perPages=8) {
  const page = songs.slice(start, start + perPages);
  
  const embed = {
    title: "Song Queue",
    color: 0x0099ff,
    description: "Current Song: " + songs[0].title,
    thumbnail: { url: songs[0].thumbnail },
    fields: []
  }
  
  for (let [ index, item ] of page.entries()) {
    if (index + start === 0) { continue; }
    embed.fields.push({
      name: "\u200B",
      value: `${index + start} - ${item.title}`,
    });
  }
  
  return embed;
}

function createButton(label, id, disabled, emoji) {
  return {
    type: "BUTTON",
    label: label,
    custom_id: id,
    style: "SECONDARY",
    disabled: disabled,
    emoji: {
      animated: false,
      id: null,
      name: emoji
    }
  }
}

async function queue(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) return message.channel.send('There is nothing playing.');
  
  const backButton = createButton("Back", "back_button", false, "◀️");
  const nextButton = createButton("Next", "next_button", false, "▶️");
  
  let currentIndex = 0;
  let itemsPerPage = 5;
  
  const embed = createEmbed(serverQueue.songs, currentIndex, itemsPerPage);
  
  if (serverQueue.songs.length < itemsPerPage) {
    return message.channel.send({ embeds: [ embed ] });
  }
  
  const embedMessage = await message.channel.send({
    embeds: [embed], components: [
      {
        type: "ACTION_ROW",
        components: [ nextButton ]
      }
    ]
  });
  
  const collector = embedMessage.createMessageComponentCollector();
  
  collector.on("collect", async interaction => {
    interaction.customId === "back_button" ?
    (currentIndex -= itemsPerPage) : (currentIndex += itemsPerPage);
    
    interaction.update({
      embeds: [ createEmbed(serverQueue.songs, currentIndex, itemsPerPage) ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            ...(currentIndex ? [backButton] : []),
            ...(
              (currentIndex + itemsPerPage) < serverQueue.songs.length 
              ? [nextButton] : []
            )
          ]
        }
      ]
    });
    
    return;
  });
  
  return;
}

module.exports = { name: "Queue", aliases: ["q", "queue"], main: queue }