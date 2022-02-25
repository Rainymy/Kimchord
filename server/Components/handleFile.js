"use strict";
const path = require("path");
const fs = require('fs');
const ytdl = require('ytdl-core');

const songSaveFolder = "../Songs";

if (!fs.existsSync(path.join(__dirname, songSaveFolder))) {
  fs.mkdir(path.join(__dirname, songSaveFolder), (err) => {
    if (err) { return console.error(err); }
    console.log('Songs directory created successfully!');
  });
};

function saveLocation(songs, songId, container) {
  if (!songs[songId]) {
    return path.join(__dirname, songSaveFolder, `/${songId}.${container}`);
  }
  return path.join(__dirname, songSaveFolder, `/${songs[songId][0].file}`);
}

function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => resolve(!error));
  });
}

function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => resolve(err));
  });
}

function readdirectory(dirPath) {
  return fs.readdirSync(path.join(__dirname, dirPath));
}

function makeReadStream(filePath) {
  return new Promise(function(resolve, reject) {
    const readFile = fs.createReadStream(filePath, { autoClose: true });
    
    readFile.on('error', (error) => {
      console.log('ERROR: ', error);
      reject(error);
    });
    
    readFile.on('close', () => {
      console.log('Read stream closed');
    });
    
    readFile.on('finish', () => {
      console.log('Read stream Finished');
    });
    
    readFile.on("ready", () => resolve(readFile));
  });
}

function makeWriteStream(filePath) {
  return new Promise(function(resolve, reject) {
    const streamToFile = fs.createWriteStream(filePath);
    
    streamToFile.on("finish", (err) => {
      if (err) {
        return console.error(err);
      }
      return console.log("Finished Writing to a FILE");
    });
    
    streamToFile.on("ready", (err) => resolve(streamToFile));
  });
}

async function makeYTDLStream(url, cb) {
  const streamURL = await ytdl(url, {
    filter: "audioonly",
    highWaterMark: 1024 * 1024 * 16
  });
  
  streamURL.on("error", (error) => {
    console.log("error from YTDL", error);
    cb && cb({ error: true, comment: error });
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
  readdirectory: readdirectory,
  makeReadStream: makeReadStream,
  makeWriteStream: makeWriteStream,
  makeYTDLStream: makeYTDLStream
}