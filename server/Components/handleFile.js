"use strict";
const path = require("path");
const fs = require('fs');
const ytdl = require('ytdl-core');

const { getSaveLocation } = require('./util.js');
const baseFolder = getSaveLocation();
console.log("Base save folder: ", "\x1b[33m", baseFolder, "\x1b[0m");

function saveLocation(songs, songId, container) {
  if (!songs[songId]) return path.join(baseFolder, `./${songId}.${container}`);
  return path.join(baseFolder, `./${songs[songId][0].file}`);
}

function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => resolve(!error));
  });
}

function deleteFile(filePath) {
  return new Promise((resolve, reject) => fs.unlink(filePath, resolve));
}

function parseLocalFolder() {
  const accum = {};
  const localFiles = fs.readdirSync(baseFolder);
  for (let file of localFiles) {
    const extension = path.extname(file); 
    const basename = path.basename(file, extension);
    
    if (!accum[basename]) { accum[basename] = []; }
    
    accum[basename].push({ name: basename, file: file, container: extension });
  }
  
  return accum;
}

function readFileSync(filePath) {
  return fs.readFileSync(filePath);
}

function writeFile(filePath, data, cb) {
  return new Promise(async function(resolve, reject) {
    const stream = await makeWriteStream(filePath);
    
    stream.on("finish", (err) => {
      cb && cb(err);
      return resolve(err ? false : true);
    });
    
    stream.write(data);
    stream.end();
  });
}

function makeReadStream(filePath) {
  return new Promise(function(resolve, reject) {
    const readFile = fs.createReadStream(filePath, { autoClose: true });
    
    readFile.on('error', (error) => resolve(error));
    
    readFile.on('close', () => { console.log('Read stream closed'); });
    readFile.on('finish', () => { console.log('Read stream Finished'); });
    
    readFile.on("ready", () => resolve(readFile));
  });
}

function makeWriteStream(filePath) {
  return new Promise(function(resolve, reject) {
    const streamToFile = fs.createWriteStream(filePath);
    
    streamToFile.on("finish", (err) => {
      if (err) { return console.error("ERROR from writeStream: ", err); }
      return console.log("Finished Writing to a FILE");
    });
    
    streamToFile.on("ready", (err) => resolve(streamToFile));
  });
}

async function makeYTDLStream(url, cookies, callback) {
  const cookiesString = cookies?.cookies?.map(({ name, value }) => {
    return `${name}=${value}; `;
  });
  
  const options = {
    filter: "audioonly",
    highWaterMark: 1024 * 1024 * 16
  }
  
  if (cookiesString) {
    options["requestOptions"] = {
      headers: {
        Cookie: cookiesString,
        "x-youtube-identity-token": cookies.identityToken
      }
    }
  }
  
  const streamURL = await ytdl(url, options);
  
  const cb = typeof cookies === "function" ? cookies: callback;
  if (!cb) { console.warn("WARNING NO CALLBACK!!"); }
  
  streamURL.on("error", (error) => {
    console.log("error from YTDL", error);
    cb && cb({ error: true, comment: `Status Code ${error.statusCode}` });
  });
  
  streamURL.on("data", (data) => {
    // console.log("data", data.length / 1024, "KiB");
  });
  
  streamURL.on("finish", () => {
    console.log("FINISHED Reading Audio from YTDL");
    cb && cb({ error: false, comment: null });
  });
  
  return streamURL;
}

module.exports = {
  saveLocation: saveLocation,
  checkFileExists: checkFileExists,
  deleteFile: deleteFile,
  parseLocalFolder: parseLocalFolder,
  readFileSync: readFileSync,
  writeFile: writeFile,
  makeReadStream: makeReadStream,
  makeWriteStream: makeWriteStream,
  makeYTDLStream: makeYTDLStream
}