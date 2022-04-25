const { codeBlock } = require('../../Components/markup.js');

function logServerSongList(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  
  if (arg.length < 1) { return message.channel.send("Require Guild ID"); }
  
  const serverQueue = queue.get(arg);
  
  if (!serverQueue) {
    return message.channel.send(
      `Either no Guild has id of \`${arg}\` or Has no queue`
    );
  }
  
  const accum = [];
  serverQueue.songs.reduce((acc, curr) => {
    return accum.push(`${accum.length + 1}. ${curr.title}`);
  }, []);
  
  return message.channel.send(codeBlock(accum.join("\n").substring(0, 1993)));
}

module.exports = {
  name: "Log Server Song",
  aliases: "logserversonglist",
  main: logServerSongList,
  isHidden: true
}