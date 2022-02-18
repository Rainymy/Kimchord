const { readdirSync } = require('fs');
const path = require('path');

function commands() {
  let commandPath = path.join(__dirname, "../Commands");
  const files = readdirSync(commandPath);
  
  let commmand = {};
  let status = {}
  let lastIndex = -1;
  
  for (let [ index, file ] of files.entries()) {
    if (path.extname(file) !== ".js") {
      status[file] = { status: '❌' };
      continue;
    }
    
    let commandFunction = require(path.join(commandPath, file));
    
    if (Array.isArray(commandFunction.aliases)) {
      for (let alias of commandFunction.aliases) {
        commmand[alias] = commandFunction;
        
        if (index + 1 !== lastIndex) {
          status[alias] = { ...commandFunction, index: index + 1 };
        }
        
        lastIndex = index + 1;
      }
      continue;
    }
    
    commmand[commandFunction.aliases] = commandFunction;
    
    status[commandFunction.aliases] = { ...commandFunction, index: index + 1 };
  }
  
  return [ commmand, status ];
}

module.exports = { commands }