const { codeBlock } = require('../../Components/markup.js');
const path = require('node:path');

const rootDir = path.join(path.resolve("./"), "./package.json");
const { version } = require(rootDir);

async function getBotVersion(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  
  message.channel.send(codeBlock(`version: ${version}`, "js"));
}

module.exports = {
  name: "Version",
  aliases: "version",
  main: getBotVersion,
  isHidden: true
}