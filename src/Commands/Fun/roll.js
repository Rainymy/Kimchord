"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

function roll(message, basicInfo, arg, queue) {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return message.channel.send(`You rolled ${randomNumber}`);
}

module.exports = {
  name: "Roll 1-100",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: ["roll"],
  main: roll
}
