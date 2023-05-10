"use strict";
const fs = require('node:fs');
const path = require("node:path");

const { DOWNLOAD_MAX_ALLOWED_HOURS: MAX_ALLOWED_HOUR } = require('../../config.json');
const DLP = require('../API/ytDLPHandler.js');

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
      console.log("Exit Code: ", error.exitCode);
      console.log("ERROR from makeReadStream: ", error);
      readFile.destroy();
      resolve({ error: true, comment: "Internal error!" });
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
      
      console.log("Caught error in makeWriteStream: ", error);
    });
    
    streamToFile.on("finish", (err) => {
      if (!err) { return; }
      console.error("ERROR from writeStream: ", err);
    });
    
    streamToFile.on("close", async () => {
      if (await getFilesizeInBytes(filePath) !== 0) { return; }
      
      const err = await deleteFile(filePath);
      if (err) { return console.log("Encountered error <deleting>. ", err); }
    });
    
    resolve(streamToFile);
  });
}

async function makeDLPStream(video, cb=()=>{}) {
  const metadata = await DLP.getMetadata(video.url);
  const readableStream = DLP.createDownload(video.url, video.isLive);
  
  const finallyCallback = (returnValue) => {
    readableStream.emit("existing_stream", returnValue);
    return cb(returnValue);
  }
  
  readableStream.on("error", (error) => {
    if (error.myError === false) { console.log("error from YT_DLP", error); }
    
    for (let stream of readableStream._readableState.pipes) {
      readableStream.unpipe(stream);
      stream.emit("error", error);
    }
    
    let returnValue = { error: true, comment: `Status Code ${error.statusCode}` }
    
    if (error.myError) {
      returnValue = { error: true, comment: error.info.message };
    }
    
    return finallyCallback(returnValue);
  });
  
  readableStream.on("finish", () => {
    readableStream.emit("fileSize", metadata.filesize);
    video.duration = metadata.duration;
    
    return finallyCallback({ error: false, comment: null, video: video });
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