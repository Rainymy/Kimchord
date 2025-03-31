"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function stop(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }

  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  return;
}

/** @type {import("../CommandModule.js").CommandModule} */
const command = {
  name: "Stop",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: "stop",
  main: stop
}

module.exports = command;
