"use strict";
const { PRESETS } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function skip(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }
  
  serverQueue.audioPlayer.stop();
  return message.channel.send(messageInfo.skippingSong);
}

module.exports = {
  name: "Skip",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: [ "s", "skip" ],
  main: skip
};