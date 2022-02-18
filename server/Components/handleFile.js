"use strict";
const path = require("path");
const fs = require('fs');
const ytdl = require('ytdl-core');
// const youtube_stream = require("youtube-audio-stream");

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
  if (Array.isArray(songs[songId])) {
    return path.join(__dirname, songSaveFolder, `/${songs[songId][0].file}`);
  }
  return path.join(__dirname, songSaveFolder,`/${songs[songId].file}`);
}

function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => resolve(!error));
  });
}

function deleteFile(filePath) {
  return new Promise(function(resolve, reject) {
    fs.unlink( filePath, (err) => {
      if (err) { return resolve(err); }
      return resolve();
    });
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
    highWaterMark: 1024 * 1024 * 4
  });
  
  streamURL.on("error", (error) => {
    console.log("error from YTDL", error);
    cb({ success: false, error: error });
  });
  
  streamURL.on("data", (data) => {
    // console.log("data", data.length / 1024, "KiB");
  });
  
  streamURL.on("finish", () => {
    console.log("FINISHED DOWNLOAD");
    cb({ success: true, error: false });
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