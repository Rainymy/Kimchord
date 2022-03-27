const { codeBlock } = require('../../Components/markup.js');

function hideServerSize(message, basicInfo, arg, queue, client) {
  if (!basicInfo.isDev) { return; }
  
  if (!arg.length) {
    return message.channel.send('Need value of "true" or "false"');
  }
  
  let status;
  
  if (arg.toLowerCase() === "true") { status = true; }
  if (arg.toLowerCase() === "false") { status = false; }
  
  basicInfo.cb("updateActivity", status);
  return;
}

module.exports = {
  name: "Hide Server Size",
  aliases: "hideserversize",
  main: hideServerSize,
  isHidden: true
}