"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function skipTo(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }

  const skippingTo = parseInt(arg);
  if (Number.isNaN(skippingTo) || skippingTo < 1 ) {
    return message.channel.send(
      `Please select number between 1-${ serverQueue.songs.length }`
    );
  }

  if (skippingTo === serverQueue.songs.length) {
    serverQueue.audioPlayer.stop();
    return message.channel.send(codeBlock(messageInfo.skippingSong));
  }

  if (skippingTo > serverQueue.songs.length - 1) {
    return message.channel.send(
      codeBlock(
        `You are overskipping, there are ${serverQueue.songs.length} song in queue`
      )
    );
  }

  serverQueue.songs.splice(0, skippingTo - 1);
  serverQueue.audioPlayer.stop();
  message.channel.send(codeBlock(`Skipping to [ ${serverQueue.songs[1].title} ]`));
  return;
}

module.exports = {
  name: "Skip to",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: [ "st", "skipto" ],
  main: skipTo
};
