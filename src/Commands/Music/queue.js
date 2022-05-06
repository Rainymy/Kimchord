"use strict";
const {
  createSongListEmbed,
  createButton,
  createPageIndicator
} = require('../../Components/discordComponents.js');
const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

async function queue(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) { return message.channel.send(messageInfo.nothingPlaying); }
  if (!serverQueue.songs.length) {
    return message.channel.send("Queue is empty");
  }
  
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
    return message.channel.send({ files: [ ...default_path ], embeds: [ embed ] });
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
    
    if (!newEmbed) { return collector.stop("Empty list"); }
    
    if (!newEmbed.fields.length) {
      index -= itemsPerPage;
      newEmbed = createSongListEmbed(songQueue, index, itemsPerPage);
    }
    
    if (songQueue[0].type === "radio" && !newEmbed.thumbnail.url) {
      newEmbed.thumbnail.url = radio_image;
      default_path = [ radio_path ];
    }
    
    if (songQueue.length - 1 <= itemsPerPage) {
      interaction.update({
        files: [ ...default_path ], embeds: [ newEmbed ], components: []
      });
      return collector.stop("Single page list");
    }
    
    interaction.update({
      files: [ ...default_path ], embeds: [ newEmbed ], components: [
        {
          type: "ACTION_ROW",
          components: [
            ...(index ? [backButton] : []),
            ...((index + itemsPerPage) < songQueue.length ? [nextButton] : []),
            ...createPageIndicator(songQueue.length, index, itemsPerPage)
          ]
        }
      ]
    });
    
    return;
  });
  
  collector.on('end', async (collected, reason) => {
    if (reason === "Single page list") { return; }
    
    try { await embedMessage.edit(messageInfo.songQueueCollectorEnd); } 
    catch (e) { console.log("Message deleted before collector timeout."); }
  });
  
  return;
}

module.exports = {
  name: "Song queue",
  aliases: ["q", "queue"],
  main: queue
}