"use strict";
const path = require('node:path');
const { readdirSync } = require('node:fs');

const { PRESETS } = require('../../Components/permissions.js');
const { createDropdown } = require('../../Components/discordComponents.js');

const categories = {};

for (let category of readdirSync(path.join(__dirname, "../"))) {
  if (category.endsWith("#")) { continue; }
  categories[category] = {
    label: category,
    description: `All ${category} Commands`,
    value: category,
    default: false
  }
}

function createEmbed(selected_id, message) {
  const placeholder = {
    name: "\u200B",
    value: "Select category from dropdown below."
  }
  
  return {
    color: 0x0099ff,
    title: selected_id ? categories[selected_id].label : "Help Center",
    timestamp: new Date(),
    fields: [
      ...(selected_id ? [] : [placeholder])
    ],
    footer: {
      text: message.author.globalName,
      icon_url: message.author.displayAvatarURL({ dynamic: true }),
    },
  }
}

function makeEmbed(newEmbed, options) {
  return { embeds: [ newEmbed ], components: [ createDropdown(options) ] }
}

async function help(message, basicInfo, arg, commands) {
  const embed = createEmbed(undefined, message);
  
  const options = [];
  for (let category in categories) { options.push(categories[category]); }
  
  const sentMessage = await message.channel.send(makeEmbed(embed, options));
  
  const collector = sentMessage.createMessageComponentCollector({
    time: 5 * 60 * 1000
  });
  
  collector.on("collect", async interaction => {
    const newEmbed = createEmbed(interaction.values[0], message);
  
    let index = 1;
    let valueText;
    for (let command in commands) {
      if (commands[command].isHidden) { continue; }
      if (commands[command].category === interaction.values[0]) {
        valueText = `${commands[command].name}: <${commands[command].aliases}>`
        newEmbed.fields.push({
          name: "".padStart(60, "-"),
          value: `${index++}. ${valueText}`
        });
      }
    }
  
    for (let option of options) {
      option.default = option.value === interaction.values[0];
    }
  
    interaction.update(makeEmbed(newEmbed, options));
  });
  
  collector.on('end', async collected => {
    try { await sentMessage.edit("Time out"); } 
    catch (e) { console.log("Message deleted before collector timeout."); }
  });
}

module.exports = {
  name: "Help",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "help",
  main: help
};