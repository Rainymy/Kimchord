const { codeBlock } = require('../../Components/markup.js');

function voiceCount(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  
  const servers = [];
  let index = 0;
  let server;
  let serverText;
  
  for (const [key, value] of client.voice.adapters) {
    server = client.guilds.cache.get(key);
    serverText = `${++index}. ${server.name}`;
    
    const serverQueue = queue.get(server.id);
    if (serverQueue) {
      let title = serverQueue.songs[0].title;
      serverText += ` || Queue: ${serverQueue.songs.length} || ${title}`;
    }
    
    servers.push(`${serverText}`);
  }
  
  if (!servers.length) {
    return message.channel.send("I'm not in any voice channel.");
  }
  
  return message.channel.send(codeBlock(servers.join("\n"), "scala"));
}

module.exports = {
  name: "Bot voice count",
  aliases: [ "voicecount" ],
  main: voiceCount,
  isHidden: true
}