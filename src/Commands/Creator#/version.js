"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const { codeBlock } = require('../../Components/embed/markup.js');
const path = require('node:path');

const rootDir = path.join(path.resolve("./"), "./package.json");
const { version } = require(rootDir);

async function getBotVersion(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }

  message.channel.send(codeBlock(`version: ${version}`, "js"));
}

module.exports = {
  name: "Version",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "version",
  main: getBotVersion,
  isHidden: true
}
