"use strict";
const https = require('https');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');
const { getVideoDurationInSeconds } = require("get-video-duration");

function YouTube() {
  function removeExtraImgQuery(url) {
    const parseURL = new URL(url);
    return parseURL.origin + parseURL.pathname;
  }
  
  function tryParseToJsonElseToText(data) {
    try { return JSON.parse(data); } 
    catch (e) { return data; }
  }
  
  async function getBasicInfo(videoUrl) {
    return new Promise(function(resolve, reject) {
      const baseUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`;
      const nativeHttps = https.get(baseUrl, (res) => {
        let data = "";
        
        res.on("data", (chunk) => { return data += chunk; });
        res.on("end", () => {
          const info = tryParseToJsonElseToText(data);
          const response = typeof info === "string" ? { title: info } : info;
          
          if (typeof info !== "string") { return resolve(response); }
          if (info === "Not Found") { return resolve(); }
          if (info === "Bad Request") { return resolve(); }
          
          return resolve({ title: info });
        });
      });
      
      nativeHttps.on("error", (err) => reject(err));
    });
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
    return [ seconds, format ];
  }
  
  this.getYoutubeData = async function (input) {
    let video;
    try {
      video = await this.getVideo(input);
      if (!video) { video = await this.getPlaylist(input); }
      // console.log("video", video);
    } catch (e) {
      try {
        let videos = await this.searchVideos(input);
        video = await this.getVideoByID(videos[0]?.id);
        console.log(video);
      } 
      catch (err) { console.error(err); }
    }
    
    return video ?? [];
  }
  
  this.getVideo = async function (content) {
    const url = new URLSearchParams(new URL(content).search);
    const videoId = url.get("v");
    
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
  
  this.getPlaylist = async function (content) {
    const parseSearchURL = new URL(content);
    
    if (parseSearchURL.pathname !== "/playlist") { return; }
    
    const url = new URLSearchParams(parseSearchURL.search);
    const playListId = url.get("list");
    
    const response = await ytpl(playListId);
    
    for (let item of response.items) {
      delete item.index;
      delete item.shortUrl;
      delete item.thumbnails;
      delete item.isLive;
      delete item.isPlayable;
      
      item.thumbnail = removeExtraImgQuery(item.bestThumbnail.url)
      delete item.bestThumbnail;
      
      item.duration = item.durationSec;
      delete item.durationSec;
    }
    
    return {
      type: "playlist",
      title: response.title,
      thumbnail: response.bestThumbnail.url,
      itemCount: response.estimatedItemCount,
      views: response.views,
      playlistURL: response.url,
      playlist: response.items
    }
  }
}

module.exports = YouTube;