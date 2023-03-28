"use strict";
const path = require('node:path');
const EventEmitter = require('node:events');

const {
  makeWriteStream,
  makeDLPStream,
  makeReadStream,
  deleteFile,
  checkFileExists,
  parseLocalFolder
} = require("./handleFile.js");

const Cookies = require('./Cookies.js');
const YT_DLP = require('../API/ytDLPHandler.js');

function File_Manager() {
  this.queue = new Map();
  this.modQueue = {
    get: (id) => { return this.queue.get(id); },
    exists: (id) => { return this.queue.has(id); },
    append: (id, stream) => {
      this.events.emit("downloading", stream);
      return this.queue.set(id, stream);
    },
    remove: (id) => {
      this.events.emit("downloaded", this.modQueue.get(id));
      return this.queue.delete(id);
    }
  }
  this.cache;
  this.modCache = {
    get: (id) => { return this.cache.get(id); },
    has: (id) => { return this.cache.has(id); },
    append: (video) => {
      const saved = this.modCache.get(video.id);
      const newEntry = this.createDescriptor(video.id, video.container);
      
      console.log([ ...this.queue ]);
      
      if (!saved) {
        this.events.emit("finished", newEntry);
        return this.cache.set(video.id, [ newEntry ]);
      }
      
      const notExists = saved.every((cur) => cur.container !== video.container);
      if (notExists) {
        this.events.emit("finished", newEntry);
        saved.push(newEntry);
      }
      
      return;
    },
    remove: (id) => {
      const saved = this.modCache.get(id);
      
      if (saved && saved.length > 1) { return saved.shift(); }
      return this.cache.delete(id);
    }
  }
  
  this.cookies;
  this.events = new EventEmitter();
  this.events.on("error", (error) => {
    return console.log("Error from EventEmitter: ", error);
  });
  
  this.init = async (baseFolder) => {
    this.baseFolder = baseFolder;
    this.cache = parseLocalFolder(this.baseFolder);
    this.cookies = await Cookies.get();
    
    this.YT_DLP = await YT_DLP.init();
    this.YT_DLP.setCookie(Cookies.netscapeCookiePath);
    
    return this;
  }
  
  this.saveLocation = (video) => {
    if (!this.modCache.has(video.id)) {
      return path.join(this.baseFolder, `./${video.id}.${video.container}`);
    }
    return path.join(this.baseFolder, `./${this.modCache.get(video.id)[0].file}`);
  }
  
  this.checkFileExists = async (filePath) => await checkFileExists(filePath);
  
  this.createDescriptor = (name, container) => {
    return { name: name, file: `${name}.${container}`, container: container }
  }
  
  this.read = async (video) => {
    const filePath = this.saveLocation(video);
    const stream = await makeReadStream(filePath);
    
    return stream;
  }
  
  this.delete = async (video) => {
    const filePath = this.saveLocation(video);
    
    const err = await deleteFile(filePath);
    if (err) { return { error: true, comment: err }; }
    
    this.modCache.remove(video.id);
    
    return { error: false, comment: null };
  }
  
  this.download = async (video, callback) => {
    const cb = (result) => {
      clearTimeout(video.id);
      
      this.modQueue.remove(video.id);
      
      if (!result.error) { this.modCache.append(video); }
      else { this.modCache.remove(video.id); }
      
      callback(result);
    }
    
    if (this.modQueue.exists(video.id)) {
      const { stream } = this.modQueue.get(video.id);
      stream.on("existing_stream", cb);
      
      return console.log("Duplicated request stream: ", video.title);
    }
    
    const filePath = this.saveLocation(video);
    const timeoutTimer = 1000 * 60 * 60 * 30;
    
    const streamURL = await makeDLPStream(video, this.cookies, cb);
    const streamToFile = await makeWriteStream(filePath);
    
    function cancelDownload() {
      const customError = new Error("Download timeout");
      customError.myError = true;
      customError.info = {
        message: `Cancelling download: Idle timer reached ${timeoutTimer}ms`
      }
      
      return streamURL.emit("error", customError);
    }
    
    const data = {
      id: video.id,
      title: video.title,
      url: video.url,
      requestedTime: video.requestedTime,
      stream: streamURL
    }
    
    setTimeout(cancelDownload, timeoutTimer);
    this.modQueue.append(video.id, data);
    
    return streamURL.pipe(streamToFile);
  }
  
  this.liveStream = async (video, callback) => {
    return await makeDLPStream(video, this.cookies, callback);
  }
  
  return this;
}

module.exports = File_Manager;