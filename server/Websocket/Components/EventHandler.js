const fs = require('node:fs');
const path = require('node:path');

const events = {};

let hasInit = false;
function init() {
  if (hasInit) { return console.log("Inited eventHandler"); }
  
  const commandFolder = path.join(__dirname, "../Commands");
  
  for (let command of fs.readdirSync(commandFolder)) {
    const meta = require(path.join(commandFolder, command));
    
    events[meta.event] = meta;
  }
  
  hasInit = true;
}

async function switchEvent(wss, ws, message) {
  if (!hasInit) { init(); }
  
  const [ event, data ] = JSON.parse(message);
  
  if (!events[event]) {
    return console.log("EVENT NOT FOUND!!!");
  }
  
  await events[event].main(wss, ws, data);
}

module.exports = switchEvent;