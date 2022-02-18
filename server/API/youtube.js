const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const { getVideoDurationInSeconds } = require("get-video-duration");
const fetch = (...args) => import('node-fetch')
.then(({default: fetch}) => fetch(...args));

function YouTube() {
  function isValidURL(value) {
    let expression = 
    /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let regexp = new RegExp(expression);
    return regexp.test(value);
  }
  
  function isYoutubeLink(url) {
    const youtubeHost = /^(https?\:\/\/)?(www\.)?(\.youtube\.com|youtu\.?be).+$/gm;
    let temp = new URL(url);
    let isYoutube = youtubeHost.test(temp.hostname);
    
    return !isYoutube;
  }
  
  async function getBasicInfo(videoUrl) {
    const baseURL = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`;
    const res = await fetch(baseURL);
    const clone = res.clone();
    let data;
    
    // if try fails then video is not available.
    try { data = await res.json(); } 
    catch (e) { data = { title: await clone.text() } }
    
    return data;
  }
  
  async function parseYTDLBasicInfo(videoId) {
    if (!videoId) { return; }
    
    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
    
    const video = await getBasicInfo(videoURL);
    
    if (!video) { return; }
    return {
      url: videoURL,
      id: videoId,
      title: video.title,
      thumbnail: video.thumbnail_url
    }
  }
  
  this.getVideoDurationInSeconds = async function (resourcePath) {
    return await getVideoDurationInSeconds(resourcePath);
  }
  
  this.getDurationById = async function (videoId) {
    let info = await ytdl.getInfo(videoId);
    let format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
    
    const seconds = format.approxDurationMs / 1000;
    return [ seconds, format.container ];
  }
  
  this.getYoutubeData = async function (input) {
    let video;
    try {
      video = await this.getVideo(input);
      // console.log("video", video);
    } catch (e) {
      try {
        let videos = await this.searchVideos(input);
        video = await this.getVideoByID(videos[0]?.id);
        // console.log(video);
      } catch (err) {
        console.error(err);
      }
    }
    return video ?? [];
  }
  
  this.getVideo = async function (content) {
    let url = new URLSearchParams(new URL(content).search);
    let videoId = url.get("v");
    
    return await parseYTDLBasicInfo(videoId);
  }
  
  this.getVideoByID = async function (videoId) {
    return await parseYTDLBasicInfo(videoId);
  }
  
  this.searchVideos = async function (input) {
    const filter = await ytsr.getFilters(input);
    const filter1 = filter.get("Type").get("Video");
    if (!filter1.url) { return []; }
    
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    
    return searchResults.items;
  }
  
  this.getPlaylist = function () {
    return;
  }
}

module.exports = YouTube;