"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function resume(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }

  if (serverQueue.playing) {
    return message.channel.send(messageInfo.songPlaying);
  }

  serverQueue.playing = true;
  serverQueue.audioPlayer.unpause();

  const pausedDuration = Date.now() - serverQueue.songs[0].time.pause;
  serverQueue.songs[0].time.start += pausedDuration;

  return;
}

module.exports = {
  name: "Resume",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: ["resume", "continue"],
  main: resume
}
