const { readdirSync, existsSync, mkdir } = require('fs');
const path = require('path');

function commands() {
  const commandPath = path.join(__dirname, "../Commands");
  const files = readdirSync(commandPath);
  
  const commmand = {};
  const status = {}
  let lastIndex = -1;
  let commandFunction;
  
  for (let [ index, file ] of files.entries()) {
    if (path.extname(file) !== ".js") {
      status[file] = { status: '❌' };
      continue;
    }
    
    commandFunction = require(path.join(commandPath, file));
    
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

function Start() {
  this.commands = commands;
  this.essentialFolders = [ "../playlistFolder" ];
  this.init = () => {
    let pathToFolder;
    for (let folder of this.essentialFolders) {
      pathToFolder = path.join(__dirname, folder);
      
      if (!existsSync(pathToFolder)) {
        mkdir(pathToFolder, (err) => {
          if (err) { return console.error(err); }
          console.log(pathToFolder, 'directory created successfully!');
        });
      };
    }
    
    return this;
  }
}

module.exports = new Start();