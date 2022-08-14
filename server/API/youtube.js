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
      type: "video",
      title: video.title,
      requestedTime: (new Date()).toLocaleString(),
      thumbnail: video.thumbnail_url
    }
  }
  
  function isValidYoutubeHostLink(host) {
    const hostlink = host.substring(0, 4) === "www." ? host.substring(4): host;
    const youtubeValidLinkList = [
      "youtube.com",
      "m.youtube.com",
      "youtu.be",
      "youtube-nocookie.com"
    ];
    
    // if hostlink matches a link in the array returns true.
    return youtubeValidLinkList.indexOf(hostlink) >= 0;
  }
  
  this.getVideoDurationInSeconds = async function (resourcePath) {
    return await getVideoDurationInSeconds(resourcePath);
  }
  
  this.getDurationById = async function (videoId) {
    try {
      let info = await ytdl.getInfo(videoId);
      let format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
      
      const seconds = format.approxDurationMs / 1000;
      return [ seconds, format ];
    }
    catch (e) { return [ null, { container: "mp4" } ]; }
  }
  
  this.getYoutubeData = async function (input) {
    let video;
    let isValidLink = false;
    
    try {
      const parsed_URL = new URL(input);
      isValidLink = true;
      
      if (!isValidYoutubeHostLink(parsed_URL.host)) { throw "Not a youtube link"; }
      
      video = await this.getVideo(parsed_URL) ?? await this.getPlaylist(parsed_URL);
    }
    catch (e) {
      try {
        if (isValidLink) { throw "Exiting cause of the valid URL link"; }
        
        const foundVideos = await this.searchVideos(input);
        video = await this.getVideoByID(foundVideos[0]?.id);
      } 
      catch (err) {
        if (!isValidLink) {
          console.log(err);
        }
      }
    }
    
    console.log("Parsed data: ", video ?? `[ Failed to parse - ${input}] `);
    return video ?? [];
  }
  
  this.getVideo = async function ({ search, host, pathname }) {
    let videoId;
    
    if (host === "youtu.be" && pathname.length === 12) {
      videoId = pathname.substring(1);
    }
    else {
      const url = new URLSearchParams(search);
      videoId = url.get("v");
    }
    
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
  
  this.getPlaylist = async function ({ search, pathname }) {
    if (pathname !== "/playlist") { return; }
    
    const url = new URLSearchParams(search);
    const playListId = url.get("list");
    
    let response;
    try { response = await ytpl(playListId); }
    catch (e) { return false; }
    
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