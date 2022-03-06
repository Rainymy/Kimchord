async function logEveryServerName(message, basicInfo, arg, queue, client) {
  const serverNames = [];
  let textCharLimit = 1987;
  let index = 0;
  client.guilds.cache.forEach((guild, serverId) => {
    let guildName = guild.name.padStart(30, " ");
    let text = `${guildName} || ${((++index) + "").padEnd(2)} || ${serverId}`;
    serverNames.push( text );
  });
  
  if (serverNames.join("\n").length > textCharLimit) {
    let endIndex = serverNames.join("\n").length / textCharLimit;
    let loopIndex = 0;
    let part;
    
    while (loopIndex <= endIndex) {
      part = serverNames.join("\n").substring(
        textCharLimit * loopIndex, textCharLimit * (loopIndex + 1)
      );
      
      message.channel.send(`\`\`\`js\n${part}\n \`\`\` `);
      loopIndex++;
    }
    
    return;
  }
  
  return message.channel.send(`\`\`\`js\n${serverNames.join("\n")}\n\`\`\` `);
}

module.exports = {
  name: "List server names",
  aliases: "logserver",
  category: "moderation",
  main: logEveryServerName,
  isHidden: true
};