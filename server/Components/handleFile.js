"use strict";
const path = require("node:path");
const fs = require('node:fs');

const DLP = require('../API/ytDLPHandler.js');

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

function parseLocalFolder(baseFolder) {
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
      readFile.destroy();
      resolve(error);
    });
  
    readFile.on('close', () => { console.log('Read stream closed'); });
    readFile.on('finish', () => { console.log('Read stream Finished'); });
  
    readFile.on("ready", () => resolve(readFile));
    
    return;
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
      
      if (error.myError) {
        return console.log(error.info.message);
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

async function makeDLPStream( video, cookies, cb=()=>{} ) {
  let downloadedBytes = 0;
  
  const metadata = await DLP.getMetadata(video.url);
  const readableStream = DLP.createDownload(video.url, video.isLive);
  
  readableStream.on("data", (data) => { downloadedBytes += data.length; });
  
  readableStream.on("error", (error) => {
    if (error.myError === false) { console.log("error from YT_DLP", error); }
    
    for (let stream of readableStream._readableState.pipes) {
      readableStream.unpipe(stream);
      
      const err = error.myError ? error : new Error(custom_errors.ytdl_error);
      stream.emit("error", err);
    }
    
    let returnValue = { error: true, comment: `Status Code ${error.statusCode}` }
    
    if (error.statusCode === 410) {
      const restrictionsExemple = 'Geography, Suicide/Self harm/Copyright blocked';
      
      returnValue = {
        error: true,
        comment: `Restricted (${restrictionsExemple}) videos are not supported.`
      }
    }
    
    if (error.myError) { returnValue = { error: true, comment: error.info.message } }
    
    readableStream.emit("existing_stream", returnValue);
    return cb(returnValue);
  });
  
  readableStream.on("finish", () => {
    logDownload(video, metadata.filesize, downloadedBytes);
    
    video.duration = metadata.duration;
    
    const returnValue = { error: false, comment: null, video: video };
    
    readableStream.emit("existing_stream", returnValue);
    return cb(returnValue);
  });
  
  
  return readableStream;
}

module.exports = {
  checkFileExists: checkFileExists,
  deleteFile: deleteFile,
  parseLocalFolder: parseLocalFolder,
  readFileSync: readFileSync,
  writeFile: writeFile,
  makeReadStream: makeReadStream,
  makeWriteStream: makeWriteStream,
  makeDLPStream: makeDLPStream
}