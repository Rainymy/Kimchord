"use strict";
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');
const { getVideoDurationInSeconds } = require("get-video-duration");
const fetch = (...args) => import('node-fetch')
.then(({default: fetch}) => fetch(...args));

function YouTube() {
  function removeExtraImgQuery(url) {
    const parseURL = new URL(url);
    return parseURL.origin + parseURL.pathname;
  }
  
  async function getBasicInfo(videoUrl) {
    const baseURL = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`;
    const res = await fetch(baseURL);
    const clone = res.clone();
    let data;
    
    // if try fails then video is not available.
    try { data = await res.json(); } 
    catch (e) {
      const textString = await clone.text();
      if (textString === "Not Found") { return; }
      if (textString === "Bad Request") { return; }
      data = { title: textString }
    }
    
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
    return [ seconds, format ];
  }
  
  this.getYoutubeData = async function (input) {
    let video;
    try {
      video = await this.getVideo(input);
      if (!video) {
        video = await this.getPlaylist(input);
      }
      // console.log("video", video);
    } catch (e) {
      try {
        let videos = await this.searchVideos(input);
        video = await this.getVideoByID(videos[0]?.id);
        console.log(video);
      } catch (err) {
        console.error(err);
      }
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