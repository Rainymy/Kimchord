"use strict";
const path = require("node:path");
const fs = require('node:fs');
const ytdl = require('ytdl-core');

const { getSaveLocation } = require('./util.js');
const baseFolder = getSaveLocation();
console.log("Base save folder: ", "\x1b[33m", baseFolder, "\x1b[0m");

const custom_errors = {
  ytdl_error: "ytdl_error"
}

function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => resolve(!error));
  });
}

function getFilesizeInBytes(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (error, stats) => resolve(stats?.size ?? 0));
  });
}

function deleteFile(filePath) {
  return new Promise((resolve, reject) => fs.unlink(filePath, resolve));
}

async function logDownload(video, metadataBytes, downloadedBytes) {
  const totalBytes = Math.round(metadataBytes / 1024)
  const downloadBytes = Math.round(downloadedBytes / 1024);
  
  console.log("-----------------------------------------------------------");
  console.log(`Downloaded:`);
  console.log(` ╠ ${video.title}`);
  console.log(` ╠ ${video.url}`);
  console.log(` ╚ ${totalBytes} / ${downloadBytes} KiB`);
  console.log("-----------------------------------------------------------");
  
  const savingText = [
    "----------------------------------------------------------------------",
    `${video.title}`,
    ` ╠ ${new Date().toLocaleString("sv-Sv") + " - HH:MM:SS"}`,
    ` ╚ ${video.url}\n`
  ].join("\n");
  
  const saveTextPath = path.join(__dirname, "../downloaded_songs.txt");
  const writeStream = await makeWriteStream(saveTextPath, { flags: "a+" });
  
  writeStream.write(savingText);
  writeStream.close();
  
  return;
}

function parseLocalFolder() {
  const accum = new Map();
  const localFiles = fs.readdirSync(baseFolder);
  for (let file of localFiles) {
    const extension = path.extname(file); 
    const basename = path.basename(file, extension);
    
    if (!accum.has(basename)) { accum.set(basename, []); }
    
    const saved = accum.get(basename);
    saved.push({ name: basename, file: file, container: extension });
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
    
    readFile.on('error', (error) => {
      console.log("ERROR from makeReadStream: ", error);
      resolve(error);
    });
    
    readFile.on('close', () => { console.log('Read stream closed'); });
    readFile.on('finish', () => { console.log('Read stream Finished'); });
    
    readFile.on("ready", () => resolve(readFile));
  });
}

function makeWriteStream(filePath, flags) {
  return new Promise(function(resolve, reject) {
    const streamToFile = fs.createWriteStream(filePath, flags ?? {});
    
    streamToFile.on("error", (error) => {
      streamToFile.close();
      if (error.message === custom_errors.ytdl_error) {
        return console.log("Restricted YouTube Video");
      }
      console.log("Caught error in makeWriteStream: ", error);
    });
    
    streamToFile.on("finish", (err) => {
      if (err) { return console.error("ERROR from writeStream: ", err); }
    });
    
    streamToFile.on("close", async () => {
      if (await getFilesizeInBytes(filePath) !== 0) { return; }
      
      const err = await deleteFile(filePath);
      if (err) { return console.log("Encountered error <deleting>. ", err); }
    });
    
    streamToFile.on("ready", () => resolve(streamToFile));
  });
}

function parseOptions(video, cookies, callback) {
  const cookiesString = cookies?.cookies?.map(({ name, value }) => {
    return `${name}=${value}; `;
  });
  
  const options = {
    filter: (format) => {
      const isAudioOnly = format.hasVideo === false && format.hasAudio === true;
      
      if (format.container === "mp4" && isAudioOnly) {
        callback(format);
        return true;
      }
      
      return false;
    },
    highWaterMark: 1024 * 1024 * 1024
  }
  
  if (video.isLive) {
    options.filter = (format) => {
      return [ 128, 127, 120, 96, 95, 94, 93 ].indexOf(format.itag) > -1;
    }
  }
  
  if (cookiesString) {
    options.requestOptions = {
      headers: {
        Cookie: cookiesString, 
        "x-youtube-identity-token": cookies.identityToken
      }
    }
  }
  
  return options;
}

async function makeYTDLStream(video, cookies, callback) {
  let foundFormat;
  let downloadedBytes = 0;
  
  const saveFormat = (format) => { foundFormat = format; }
  
  const options = parseOptions(video, cookies, saveFormat);
  const streamURL = await ytdl(video.url, options);
  
  let cb = typeof cookies === "function" ? cookies: callback;
  if (!cb) {
    cb = function () {};
    console.warn("WARNING NO CALLBACK!!");
  }
  
  streamURL.on("error", (error) => {
    console.log("error from YTDL", error);
    
    for (let stream of streamURL._readableState.pipes) {
      streamURL.unpipe(stream);
      stream.emit("error", new Error(custom_errors.ytdl_error));
    }
    
    let returnValue = { error: true, comment: `Status Code ${error.statusCode}` }
    
    if (error.statusCode === 410) {
      const restrictionsExemple = 'Geography, Suicide/Self harm/Copyright blocked';
      
      returnValue = {
        error: true,
        comment: `Restricted (${restrictionsExemple}) videos are not supported.`
      }
    }
    
    streamURL.emit("existing_stream", returnValue);
    return cb(returnValue);
  });
  
  streamURL.on("data", (data) => { downloadedBytes += data.length; });
  
  streamURL.on("finish", () => {
    logDownload(video, parseInt(foundFormat.contentLength), downloadedBytes);
    
    video.duration = parseInt(foundFormat.approxDurationMs) / 1000;
    
    const returnValue = { error: false, comment: null, video: video };
    
    streamURL.emit("existing_stream", returnValue);
    return cb(returnValue);
  });
  
  return streamURL;
}

module.exports = {
  checkFileExists: checkFileExists,
  deleteFile: deleteFile,
  parseLocalFolder: parseLocalFolder,
  readFileSync: readFileSync,
  writeFile: writeFile,
  makeReadStream: makeReadStream,
  makeWriteStream: makeWriteStream,
  makeYTDLStream: makeYTDLStream
}