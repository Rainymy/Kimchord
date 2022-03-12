function voiceCount(message, basicInfo, arg, queue, client) {
  const servers = [];
  let index = 0;
  for (const [key, value] of client.voice.adapters) {
    servers.push(`${++index}. ${client.guilds.cache.get(key).name}`);
  }
  
  if (!servers.length) {
    return message.channel.send("I'm not in any voice channel.");
  }
  
  return message.channel.send('```js\n' + servers.join("\n") + '```');
}

module.exports = {
  name: "Bot voice count",
  aliases: [ "voicecount" ],
  category: "moderation",
  main: voiceCount,
  isHidden: true
}