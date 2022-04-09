const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function remove(message, basicInfo, searchString, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue?.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  const REQUIRED_ROLE_NAME = basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  if (checkServerMusicRole(basicInfo.guilds_settings, message.member)) {
    return message.channel.send(
      codeBlock(messageInfo.requiresRoleName(REQUIRED_ROLE_NAME), "js")
    )
  }
  
  const number = parseInt(searchString);
  const minIndex = 0;
  const maxIndex = serverQueue.songs.length - 1;
  
  const isNumber = !isNaN(number);
  const isOverMin = searchString >= minIndex;
  const isOverMax = searchString <= maxIndex;
  
  if ( minIndex === maxIndex) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }
  
  if (!isNumber || (!isOverMin || !isOverMax)) {
    return message.channel.send(`Please select number between 1-${ maxIndex }`);
  }
  
  const removed = serverQueue.songs.splice( number , 1 )[0];
  message.channel.send(`😩 Remove: ***${removed.title}***`);
  return;
}

module.exports = {
  name: "Remove",
  aliases: "remove",
  main: remove
}