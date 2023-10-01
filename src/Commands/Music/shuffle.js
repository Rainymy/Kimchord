"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

async function shuffle(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }

  const currentSong = serverQueue.songs.shift();
  serverQueue.songs.sort(() => Math.random() - 0.5);
  serverQueue.songs.unshift(currentSong);

  return message.channel.send(codeBlock("⏯️ Shuffled your current queue ✔️"));
}

module.exports = {
  name: "Shuffle queue",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: "shuffle",
  main: shuffle
}
