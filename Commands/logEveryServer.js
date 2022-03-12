const { codeBlock } = require('../Components/markup.js');

async function logEveryServerName(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  
  const serverNames = [];
  const textCharLimit = 1987;
  let index = 0;
  
  client.guilds.cache.forEach((guild, serverId) => {
    let guildName = guild.name.padStart(25, " ");
    let text = `${guildName} || ${((++index) + "").padEnd(2)} || ${serverId}`;
    serverNames.push( text );
  });
  
  if (serverNames.join("\n").length < textCharLimit) {
    return message.channel.send(codeBlock(serverNames.join("\n"), "js"));
  }
  
  const endIndex = serverNames.join("\n").length / textCharLimit;
  let loopIndex = 0;
  let part;
  
  while (loopIndex <= endIndex) {
    part = serverNames.join("\n").substring(
      textCharLimit * loopIndex, textCharLimit * (loopIndex + 1)
    );
    
    loopIndex++;
    await message.channel.send(codeBlock(part, "js"));
  }
  
  return;
}

module.exports = {
  name: "List server names",
  aliases: "logserver",
  category: "moderation",
  main: logEveryServerName,
  isHidden: true
};