"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

async function main(message, basicInfo, searchString, queue, client) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) { return message.channel.send(messageInfo.nothingPlaying); }
  if (!serverQueue.songs.length) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }

  serverQueue.songs.splice(1, 0, serverQueue.songs[0]);
  serverQueue.audioPlayer.stop();
  return;
}

module.exports = {
  name: "Rewind",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.MUSIC,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: ["rewind", "rw", "again"],
  main: main
}
