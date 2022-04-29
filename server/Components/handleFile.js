"use strict";
const path = require("path");
const fs = require('fs');
const ytdl = require('ytdl-core');

const { getSaveLocation } = require('./util.js');
const baseFolder = getSaveLocation();
console.log("Base save folder: ", "\x1b[33m", baseFolder, "\x1b[0m");

const custom_errors = {
  ytdl_error: "ytdl_error"
}

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
    
    readFile.on('error', resolve);
    
    readFile.on('close', () => { console.log('Read stream closed'); });
    readFile.on('finish', () => { console.log('Read stream Finished'); });
    
    readFile.on("ready", () => resolve(readFile));
  });
}

function makeWriteStream(filePath) {
  return new Promise(function(resolve, reject) {
    const streamToFile = fs.createWriteStream(filePath);
    let hasError = false;
    
    streamToFile.on("error", (error) => {
      hasError = true;
      if (error.message === custom_errors.ytdl_error) {
        return console.log("Restricted YouTube Video");
      }
      console.log("Caught error in makeWriteStream: ", error);
    });
    
    streamToFile.on("finish", (err) => {
      if (err) { return console.error("ERROR from writeStream: ", err); }
      return console.log("Finished Writing to a FILE");
    });
    
    streamToFile.on("close", async () => {
      if (!hasError) { return; }
      
      const err = await deleteFile(filePath);
      if (err) { return console.log("Encountered error <deleting>. ", err); }
    });
    
    // streamToFile.on("ready", (err) => resolve(streamToFile));
    resolve(streamToFile);
  });
}

async function makeYTDLStream(video, cookies, callback) {
  const cookiesString = cookies?.cookies?.map(({ name, value }) => {
    return `${name}=${value}; `;
  });
  
  let foundFormat;
  let downloadedBytes = 0;
  
  const options = {
    filter: (format) => {
      const isAudioOnly = format.hasVideo === false && format.hasAudio === true;
      
      if (format.container === "mp4" && isAudioOnly) {
        console.log("-----------------------------------------------------");
        console.log("Found format: ", format);
        console.log("-----------------------------------------------------");
        foundFormat = format;
      }
      
      return format.container === "mp4" && isAudioOnly;
    },
    highWaterMark: 1024 * 1024 * 1024
  }
  
  if (video.isLive) {
    options.filter = (format) => {
      return [ 128, 127, 120, 96, 95, 94, 93 ].indexOf(format.itag) > -1;
    };
  }
  
  if (cookiesString) {
    options["requestOptions"] = {
      headers: {
        Cookie: cookiesString, 
        "x-youtube-identity-token": cookies.identityToken
      }
    }
  }
  
  const streamURL = await ytdl(video.url, options);
  
  let cb = typeof cookies === "function" ? cookies: callback;
  if (!cb) {
    cb = function () {}
    console.warn("WARNING NO CALLBACK!!");
  }
  
  streamURL.on("error", (error) => {
    console.log("error from YTDL", error);
    
    for (let stream of streamURL._readableState.pipes) {
      streamURL.unpipe(stream);
      stream.emit("error", new Error(custom_errors.ytdl_error));
    }
    
    if (error.statusCode === 410) {
      const restrictionsExemple = 'Geography, Suicide/Self harm/Copyright blocked';
      return cb({
        error: true,
        comment: `Restricted (${restrictionsExemple}) videos are not supported.`
      });
    }
    
    return cb({ error: true, comment: `Status Code ${error.statusCode}` });
  });
  
  streamURL.on("data", (data) => {
    downloadedBytes += data.length;
  });
  
  streamURL.on("finish", () => {
    console.log("FINISHED Reading Audio from YTDL");
    console.log("Downloaded size", Math.round(downloadedBytes / 1024) + " KiB");
    
    video.duration = parseInt(foundFormat.approxDurationMs) / 1000;
    
    cb && cb({ error: false, comment: null, video: video });
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