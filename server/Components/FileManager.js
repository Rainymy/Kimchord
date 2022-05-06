const path = require('node:path');

const {
  makeWriteStream,
  makeYTDLStream,
  makeReadStream,
  deleteFile,
  checkFileExists,
  parseLocalFolder
} = require("./handleFile.js");

const { getSaveLocation } = require('./util.js');
const Cookies = require('./Cookies.js');
const Youtube = require('../API/youtube.js');

const baseFolder = getSaveLocation();

function File_Manager(options) {
  this.queue = new Map();
  this.cache;
  this.cookies;
  
  this.options = { ...options }
  
  this.init = async () => {
    this.cache = parseLocalFolder();
    this.cookies = await Cookies.get();
    
    return this;
  }
  
  this.saveLocation = (video) => {
    if (!this.cache.has(video.id)) {
      return path.join(baseFolder, `./${video.id}.${video.container}`);
    }
    return path.join(baseFolder, `./${this.cache.get(video.id)[0].file}`);
  }
  
  this.checkFileExists = async (filePath) => {
    return await checkFileExists(filePath);
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
    
    if (this.cache.has(video.id)) {
      if (this.cache.get(video.id).length === 1) { this.cache.delete(video.id); }
      else { this.cache.get(video.id).shift(); }
    }
    
    return { error: false, comment: null }
  }
  
  this.download = async (video, callback) => {
    const filePath = this.saveLocation(video);
    
    const cb = (result) => {
      this.queue.delete(video.id);
      
      if (!result.error) {
        const saved = this.cache.get(video.id);
        
        const newEntry = {
          name: video.id,
          file: `${video.id}.${video.container}`, 
          container: video.container
        }
        
        if (!saved) { this.cache.set(video.id, [ newEntry ]); }
        else {
          const notExists = saved.every((cur) => cur.container !== video.container);
          if (notExists) { saved.push(newEntry); }
        }
      }
      else {
        if (this.cache.has(video.id) && this.cache.get(video.id).length === 1) {
          this.cache.delete(video.id);
        }
        
        if (this.cache.has(video.id) && this.cache.get(video.id).length >= 2) {
          this.cache.get(video.id).shift();
        }
      }
      
      callback(result);
    }
    
    if (this.queue.has(video.id)) {
      const existing_stream = this.queue.get(video.id);
      existing_stream.on("existing_stream", cb);
      
      return console.log("Duplicated request stream: ", video.title);
    }
    
    const streamURL = await makeYTDLStream(video, this.cookies, cb);
    const streamToFile = await makeWriteStream(filePath);
    
    this.queue.set(video.id, streamURL);
    
    return streamURL.pipe(streamToFile);
  }
  
  this.liveStream = async (video, callback) => {
    const liveStream = await makeYTDLStream(video, this.cookies, callback);
    
    return liveStream;
  }
  
  return this;
}

module.exports = File_Manager;