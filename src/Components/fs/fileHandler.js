"use strict";
const fs = require('node:fs');

/**
* @param {String} userFile
* @returns
*/
function readJSONFile(userFile) {
  let data = fs.readFileSync(userFile, "utf8");
  return JSON.parse(data);
}

/**
* @param {String} filePath
* @returns
*/
function readdirSync(filePath) {
  return fs.readdirSync(filePath);
}

/**
* @param {String} userFile
* @param {Object} data
* @returns
*/
function customWriteFileSync(userFile, data) {
  return fs.writeFileSync(
    userFile,
    JSON.stringify(data, null, 4)
  );
}

/**
* @param {String} filePath
* @returns
*/
function deleteFile(filePath) {
  return new Promise(
    (resolve, reject) => fs.unlink(filePath, resolve)
  );
}

/**
* @param {String} userFile
* @returns
*/
function customReadStream(userFile) {
  return new Promise(function (resolve) {
    let data = "";
    const readStream = fs.createReadStream(userFile, { flags: "r" });
    readStream.on("data", (chunks) => { data += chunks; });
    readStream.on("end", () => resolve(JSON.parse(!data ? "{}" : data)));
    readStream.on("error", () => resolve({}));
  });
}

/**
*
* @param {String} userFile
* @param {any} data
* @returns {Promise<Error?>}
*/
function customWriteStream(userFile, data) {
  return new Promise(function (resolve) {
    const stream = fs.createWriteStream(userFile, { flags: "w+" });
    stream.on("ready", () => {
      stream.write(JSON.stringify(data, null, 4));
      stream.end();
    });

    stream.on("finish", () => resolve(null));
    stream.on("error", resolve);
  });
}

module.exports = {
  readJSONFile: readJSONFile,
  readdirSync: readdirSync,
  writeFileSync: customWriteFileSync,
  deleteFile: deleteFile,
  customReadStream: customReadStream,
  customWriteStream: customWriteStream
}