"use strict";
const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function skipTo(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }
  
  const REQUIRED_ROLE_NAME = basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  if (checkServerMusicRole(basicInfo.guilds_settings, message.member)) {
    return message.channel.send(
      codeBlock(messageInfo.requiresRoleName(REQUIRED_ROLE_NAME), "js")
    )
  }
  
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
  aliases: [ "st", "skipto" ],
  main: skipTo
};