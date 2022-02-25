const { server } = require('../config.json');

const express = require('express');
const app = express();
const port = server.port;

const Youtube = require('./API/youtube.js');
const youtube = new Youtube();

const { validQueries } = require('./Components/validateQuery.js');
const cacheSongs = require("./Components/cacheSongs.js");
const {
  saveLocation,
  checkFileExists,
  deleteFile,
  makeReadStream,
  makeWriteStream,
  makeYTDLStream
} = require("./Components/handleFile.js");

const songs = cacheSongs.parseLocalFolder();
const maxHours = 3;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Main Page. Server working fine.");
  return;
});

app.post("/", (req, res) => {
  res.send("Main Page (POST)");
  return;
});

app.post("/remove", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "remove");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = videoData[0];
  
  const filePath = saveLocation(songs, video.id);
  
  const err = await deleteFile(filePath);
  if (err) { return res.send({ error: true, comment: err }); }
  
  cacheSongs.removeSong(songs, { name: video.id });
  res.send({ error: false, comment: `Deleted: ${video.title}` });
  
  return;
});

app.post("/download", async (req, res) => {
  const { username, userId, videoData: video } = req.body;
  
  const { error, comment } = validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const [ seconds, metadata ] = await youtube.getDurationById(video.id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (metadata.isLive) {
    return res.send({ error: true, comment: `Live streams are not supported.` });
  }
  
  if (hours >= maxHours) {
    return res.send({
      error: true,
      comment: `Max ${maxHours} hours is allowed: Video is ${hours} hours long`
    });
  }
  
  const streamURL = await makeYTDLStream(video.url, (result) => {
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
  
  streamURL.pipe(streamToFile);
  return
});

app.post("/request", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
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
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const filePath = saveLocation(songs, videoData.id);
  
  return (await makeReadStream(filePath)).pipe(res);
});

app.post("/parseSearchString", async (req, res) => {
  const { username, userId, inputQuery } = req.body;
  
  const { error, comment } = validQueries(username, userId, inputQuery, true);
  console.log({ error, comment }, "parseSearchString");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = await youtube.getYoutubeData(inputQuery);
  
  return res.send(video);
});

app.post("/getDuration", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "getDuration");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.type === "playlist") {
    const durations = [];
    for (let item of videoData.playlist) {
      const filePath = saveLocation(songs, item.id);
      durations.push(await youtube.getVideoDurationInSeconds(filePath));
    }
    
    return res.send(durations);
  }
  
  const durations = [];
  for (let item of videoData) {
    const filePath = saveLocation(songs, item.id);
    durations.push(await youtube.getVideoDurationInSeconds(filePath));
  }
  
  res.send(durations);
});

app.get("/ping", async (req, res) => {
  const { time } = req.query;
  
  res.send({ time: Date.now() });
  return;
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});
