"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');
const { codeBlock } = require('../../Components/embed/markup.js');

function hideServerSize(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  if (!(arg?.length)) { return message.channel.send('Argument required'); }

  let status;

  if (arg.toLowerCase() === "true") { status = true; }
  if (arg.toLowerCase() === "false") { status = false; }

  if (typeof status === "boolean") {
    return basicInfo.cb(client, "updateActivity", status);
  }

  return basicInfo.cb(client, "customActivity", arg);
}

/** @type {import("../CommandModule.js").CommandModule} */
const command = {
  name: "Hide Server Size",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "hideserversize",
  main: hideServerSize,
  isHidden: true
}

module.exports = command;
