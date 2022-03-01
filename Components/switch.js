const init = require('./init.js');
const [ commands, status ] = init.init().commands();
console.table(status);

function exec_command(message, basicInfo, arg, serverQueue, commandCall, client) {
  const command = commandCall.toLowerCase();
  
  if (typeof commands[command]?.main !== "function" ) {
    return message.channel.send("Command not found...");
  }
  
  if (command === "help") {
    return commands[command].main(message, basicInfo, arg, commands);
  }
  
  commands[command].main(message, basicInfo, arg, serverQueue, client);
  return;
}

module.exports = { exec_command }