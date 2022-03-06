const {
  createSongListEmbed,
  createButton,
  createPageIndicator
} = require('../Components/discordComponents.js');

const categories = {
  fun: {
    label: "Fun",
    description: "All fun Commands",
    value: "fun",
    default: false
  },
  music: {
    label: "Music",
    description: "All music Commands",
    value: "music",
    default: false
  },
  // moderation: {
  //   label: "Moderation",
  //   description: "All moderation Commands",
  //   value: "moderation",
  //   default: false
  // },
  general: {
    label: "General",
    description: "All general Commands",
    value: "general",
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
      text: message.author.username,
      icon_url: message.author.displayAvatarURL({ dynamic: true }),
    },
  }
}

function createDropdown(options) {
  return {
    type: "ACTION_ROW",
    components: [
      {
        type: "SELECT_MENU",
        customId: "select_menu",
        placeholder: "Choose a category",
        min_values: 1,
        max_values: 1,
        options: options
      }
    ]
  }
}

async function help(message, basicInfo, arg, commands) {
  const embed = createEmbed(undefined, message);
  
  const options = [];
  for (let category in categories) { options.push(categories[category]); }
  
  const sentMessage = await message.channel.send({
    embeds: [ embed ], components: [ createDropdown(options) ]
  });
  
  const time = 5 * 60 * 1000;
  const collector = sentMessage.createMessageComponentCollector({ time: time });
  
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
    
    interaction.update({
      embeds: [ newEmbed ], components: [ createDropdown(options) ]
    });
  });
  
  collector.on('end', collected => {
    sentMessage.edit("Time out");
  });
}

module.exports = {
  name: "Help",
  aliases: "help",
  category: "general",
  main: help
};