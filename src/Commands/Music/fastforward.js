"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');
const messageInfo = require('../../Components/message/messageInfo.js');

const {
  durationToString,
  stringToDurationSeconds,
  validateTime
} = require('../../Components/util/timeUtil.js');

const help = [
  "`<HH:MM:SS>` or `<Seconds>`",
  "[ff 00:1:35] or [ff 95]"
]

async function main(message, basicInfo, searchString, queue) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) { return message.channel.send(messageInfo.nothingPlaying); }
  if (!serverQueue.songs.length) {
    return message.channel.send(messageInfo.queueIsEmpty);
  }
  if (serverQueue.songs[0].type === "radio") {
    return message.channel.send("Not allowed for `radio`");
  }
  if (!searchString.length) { return message.channel.send(help.join("\n")); }

  const validate = validateTime(searchString);
  if (validate.failed) { return message.channel.send(help.join("\n")); }

  const startAt = serverQueue.songs[0].time.start;
  const duration = Math.floor(serverQueue.songs[0].duration);
  const timePlayed = Math.ceil((Date.now() - startAt) / 1000);

  if ((duration - timePlayed) <= validate.time) {
    return message.channel.send(`Remaining time: ${(duration - timePlayed)}s`);
  }

  serverQueue.songs[0].streamModification.isSkipping = true;
  serverQueue.songs[0].streamModification.isSkipRelative = validate.relative;
  serverQueue.songs[0].streamModification.skip = validate.time;

  serverQueue.songs[0].time.last_current = startAt - validate.time * 1000;

  // copy current item and put in the next index
  serverQueue.songs.splice(1, 0, serverQueue.songs[0]);
  serverQueue.audioPlayer.stop();
}

module.exports = {
  name: "Fastforward",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.MUSIC,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: ["ff", "fastforward", "fast"],
  main: main
}
