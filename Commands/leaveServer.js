const { codeBlock } = require('../Components/markup.js');

function leaveServer(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) {
    return message.channel.send("Creator Command Only!");
  }
  
  if (arg.length < 1) {
    return message.channel.send("Require Guild ID");
  }
  
  let guildRef = client.guilds.cache.get(arg);
  if (!guildRef) {
    return message.channel.send(`No Guild has id of \`${arg}\``);
  }
  
  guildRef.leave();
  return message.channel.send(
    codeBlock(`Left: [${guildRef.name}] (ID: ${guildRef.id}) 🤯`)
  );
}

module.exports = {
  name: "leaveServer",
  aliases: "leaveserver",
  category: "moderation",
  main: leaveServer,
  isHidden: true
}