const fs = require('fs');

function readJSONFile(userFile, flags) {
  let data = fs.readFileSync(userFile, flags);
  return JSON.parse(data);
}

function readdirSync(filePath) {
  return fs.readdirSync(filePath);
}

function customWriteFileSync(userFile, data) {
  return fs.writeFileSync(userFile, JSON.stringify(data, null, 4));
}

function customReadStream(userFile) {
  return new Promise(function(resolve, reject) {
    let data = "";
    const readStream = fs.createReadStream(userFile, { flags: "r" });
    readStream.on("data", (chunks) => { data += chunks; });
    readStream.on("end", () => resolve(JSON.parse(!data ? "{}" : data)));
    readStream.on("error", (error) => resolve({}));
  });
}

function customWriteStream(userFile, data) {
  return new Promise(function(resolve, reject) {
    const stream = fs.createWriteStream(userFile, { flags: "w+" });
    stream.on("ready", () => {
      stream.write(JSON.stringify(data, null, 4));
      stream.end();
    });
    
    stream.on("finish", resolve);
    stream.on("error", resolve);
  });
}

module.exports = {
  readJSONFile: readJSONFile,
  readdirSync: readdirSync,
  writeFileSync: customWriteFileSync,
  customReadStream: customReadStream,
  customWriteStream: customWriteStream
}