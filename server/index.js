const { server, DOWNLOAD_MAX_ALLOWED_HOURS: maxHours } = require('../config.json');

const express = require('express');
const app = express();

const Cookies = require('./Components/Cookies.js');
const Youtube = require('./API/youtube.js');
const youtube = new Youtube();

const cacheSongs = require("./Components/cacheSongs.js");
const util = require('./Components/util.js').init();

const {
  saveLocation,
  checkFileExists,
  deleteFile,
  parseLocalFolder,
  makeReadStream,
  makeWriteStream,
  makeYTDLStream
} = require("./Components/handleFile.js");

const songs = parseLocalFolder();

let cookies;
console.log("------------------------------------------------------");
console.log("Checking Cookies...");

if (!Cookies.exists()) {
  console.log("Generating Cookie");
  Cookies.login()
    .then((data) => { cookies = data; })
    .catch(console.log);
}
else {
  console.log("loading Cookies...");
  cookies = Cookies.load();
}

if (!cookies) { console.log("Error on Cookies."); }
else { console.log("Cookies Ready!"); }
console.log("------------------------------------------------------");

app.use(express.json());

app.get("/", (req, res) => res.send("Main Page. Server working fine."));
app.post("/", (req, res) => res.send("Main Page (POST)"));

app.post("/remove", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "remove");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = videoData[0];
  const filePath = saveLocation(songs, video.id);
  
  const err = await deleteFile(filePath);
  if (err) { return res.send({ error: true, comment: err }); }
  
  cacheSongs.removeSong(songs, { name: video.id });
  
  return res.send({ error: false, comment: `Deleted: ${video.title}` });
});

app.post("/download", async (req, res) => {
  const { username, userId, videoData: video } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const [ seconds, metadata ] = await youtube.getDurationById(video.id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (!seconds && !cookies) {
    return res.send({
      error: true,
      comment: `- Age-restricted videos are not supported.`
    });
  }
  
  if (metadata?.isLive) {
    return res.send({ error: false, comment: null, isLive: true });
  }
  
  if (hours >= maxHours) {
    return res.send({
      error: true,
      comment: `Max ${maxHours} hours is allowed: Video is ${hours} hours long`
    });
  }
  
  const streamURL = await makeYTDLStream(video, cookies, (result) => {
    if (!result.error) {
      cacheSongs.appendSong(songs, {
        name: video.id,
        container: metadata.container
      });
    }
    return res.send(result);
  });
  
  const filePath = saveLocation(songs, video.id, metadata.container);
  const streamToFile = await makeWriteStream(filePath);
  
  return streamURL.pipe(streamToFile);
});

app.post("/request", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "request");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.type === "playlist") {
    let filePath_1;
    for (let item of videoData.playlist) {
      filePath_1 = saveLocation(songs, item.id);
      item.isFile = await checkFileExists(filePath_1);
    }
    
    return res.send(videoData);
  }
  
  const checkedSongs = [];
  
  for (let item of videoData) {
    const filePath_1 = saveLocation(songs, item.id);
    item.isFile = await checkFileExists(filePath_1);
    checkedSongs.push(item);
  }
  
  return res.send(checkedSongs);
});

app.post('/songs', async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.isLive) {
    const stream = await makeYTDLStream(videoData, (result) => {
      if (result.error) { console.log(result); }
    });
    return stream.pipe(res);
  }
  
  const filePath = saveLocation(songs, videoData.id);
  const stream = await makeReadStream(filePath);
  if (util.isError(stream)) {
    return res.send({ error: true, comment: stream.exitCode });
  }
  
  return stream.pipe(res);
});

app.post("/parseSearchString", async (req, res) => {
  const { username, userId, inputQuery } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, inputQuery, true);
  console.log({ error, comment }, "parseSearchString");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = await youtube.getYoutubeData(inputQuery);
  
  return res.send(video);
});

app.post("/getDuration", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "getDuration");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.type === "playlist") {
    const durations = [];
    for (let item of videoData.playlist) {
      if (item.isLive) {
        durations.push(0);
        continue;
      }
      const filePath = saveLocation(songs, item.id);
      durations.push(await youtube.getVideoDurationInSeconds(filePath));
    }
    
    return res.send(durations);
  }
  
  const durations = [];
  for (let item of videoData) {
    if (item.isLive) {
      durations.push(0);
      continue;
    }
    const filePath = saveLocation(songs, item.id);
    try { durations.push(await youtube.getVideoDurationInSeconds(filePath)); } 
    catch (e) { console.log(e); }
  }
  
  return res.send(durations);
});

app.get("/ping", async (req, res) => {
  return res.send({ time: Date.now() });
});

app.listen(server.port, () => {
  console.log(`Server listening at http://localhost:${server.port}`)
});
