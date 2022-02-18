function leaveServer(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) {
    message.channel.send("Creator Command Only!");
    return;
  }
  
  if (arg.length < 1) {
    message.channel.send("Require Guild ID");
    return;
  }
  
  let guildRef = client.guilds.cache.get(arg);
  if (!guildRef) {
    message.channel.send(`No Guild has id of \`${arg}\``);
    return;
  }
  
  guildRef.leave();
  message.channel.send(`
    \`\`\`Left: [${guildRef.name}] (ID: ${guildRef.id}) 🤯\`\`\``);
  return;
}

module.exports = {
  name: "leaveServer", aliases: "leaveServer", main: leaveServer
}