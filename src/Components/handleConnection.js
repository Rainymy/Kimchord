"use strict";
const { joinVoiceChannel } = require('@discordjs/voice');

function createConnection(voiceChannel) {
  return joinVoiceChannel({
    channelId: voiceChannel.id,
  	guildId: voiceChannel.guild.id,
  	adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });
}

module.exports = { createConnection }