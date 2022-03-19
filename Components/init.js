const { readdirSync, existsSync, mkdir, statSync } = require('fs');
const path = require('path');

function handleFile(filePath) {
  const commandFunction = require(filePath);
  const commmand = [];
  
  if (Array.isArray(commandFunction.aliases)) {
    for (let alias of commandFunction.aliases) { commmand.push(commandFunction); }
    return commmand;
  }
  
  commmand.push(commandFunction);
  return commmand;
}

function handleAppend(command, location, insideFolder) {
  if (path.extname(location) !== ".js") { return; }
  
  const listOfCommands = handleFile(location);
  if (insideFolder) {for (let wow of listOfCommands) {wow.category = insideFolder;}}
  
  for (let [ i, times ] of listOfCommands.entries()) {
    if (Array.isArray(times.aliases)) {
      command[times.aliases[i]] = times;
      continue;
    }
    command[times.aliases] = times;
  }
  
  return listOfCommands[0];
}

function getFirstOrString(aliases) {
  return Array.isArray(aliases) ? aliases[0] : aliases;
}

function commands() {
  const commandPath = path.join(__dirname, "../Commands");
  
  const commmand = {};
  const status = {};
  let relPath;
  let stat;
  
  for (let [ index, file ] of readdirSync(commandPath).entries()) {
    relPath = path.join(commandPath, file);
    if (statSync(relPath).isFile()) {
      stat = handleAppend(commmand, relPath);
      status[ getFirstOrString(stat.aliases) ] = { ...stat };
      delete status[ getFirstOrString(stat.aliases) ].main;
      continue;
    }
    for (let sec_file of readdirSync(relPath)) {
      stat = handleAppend(commmand, path.join(relPath, sec_file), file);
      status[ getFirstOrString(stat.aliases) ] = { ...stat };
      delete status[ getFirstOrString(stat.aliases) ].main;
    }
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