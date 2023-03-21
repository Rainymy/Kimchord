"use strict";
const { PRESETS } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function stop(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }
  
  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  return;
}

module.exports = {
  name: "Stop",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: "stop",
  main: stop
};