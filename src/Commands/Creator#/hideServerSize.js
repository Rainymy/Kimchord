const { codeBlock } = require('../../Components/markup.js');

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

module.exports = {
  name: "Hide Server Size",
  aliases: "hideserversize",
  main: hideServerSize,
  isHidden: true
}