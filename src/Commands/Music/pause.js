"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function pause(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }

  if (!serverQueue.playing) {
    return message.channel.send(messageInfo.songAlreadyPaused);
  }

  serverQueue.playing = false;
  serverQueue.audioPlayer.pause();
  serverQueue.songs[0].time.pause = Date.now();
  return;
}

module.exports = {
  name: "Pause",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: ["pause", "hold"],
  main: pause
}
