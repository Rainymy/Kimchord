"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function leaveServer(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }

  if (arg.length < 1) {
    return message.channel.send("Require Guild ID");
  }

  let guildRef = client.guilds.cache.get(arg);
  if (!guildRef) {
    return message.channel.send(`No Guild has id of \`${arg}\``);
  }

  guildRef.leave();
  return message.channel.send(
    codeBlock(`Left: [${guildRef.name}] (ID: ${guildRef.id}) 🤯`)
  );
}

module.exports = {
  name: "leaveServer",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "leaveserver",
  main: leaveServer,
  isHidden: true
}
