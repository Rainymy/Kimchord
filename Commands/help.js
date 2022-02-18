function help(message, basicInfo, arg, commands) {
  const embed = {
    color: 0x0099ff,
    title: "Help Center",
    timestamp: new Date(),
    fields: [],
    footer: {
      text: message.author.username,
      icon_url: message.author.displayAvatarURL({ dynamic: true }),
    },
  }
  
  let index = -1;
  for (let command in commands) {
    if (index === commands[command].index) {
      continue;
    }
    embed.fields.push({
      name: commands[command].name || "Default name" + (index + 1),
      value: `[ ${commands[command].aliases.toString()} ]` || "Description",
      inline: true
    });
    index = commands[command].index;
  }
  
  return message.channel.send({ embeds: [embed] });
}

module.exports = { name: "Help", aliases: "help", main: help };