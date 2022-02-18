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
const maxAllowedHours = 3;

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
  
  const filePath = saveLocation(songs, videoData.id);
  
  const err = await deleteFile(filePath, videoData.title);
  if (err) { return res.send({ error: true, comment: err }); }
  
  cacheSongs.removeSong(songs, { name: videoData.id });
  res.send({ error: false, comment: `Deleted: ${videoData.title}` });
  
  return;
});

app.post("/download", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = await youtube.getYoutubeData(videoData.url);
  console.log("Video Meta: ", video);
  
  if (!video) { return console.log("Video Not Found..."); }
  
  const [ seconds, container ] = await youtube.getDurationById(video.id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (hours >= maxAllowedHours) {
    return res.send({
      success: false,
      error: `Max ${maxAllowedHours} hours is allowed but got: ${hours} hours`
    });
  }
  
  const streamURL = await makeYTDLStream(video.url, (result) => {
    if (!result.error) {
      cacheSongs.appendSong(songs, { name: video.id, container: container });
    }
    return res.send(result);
  });
  
  const filePath = saveLocation(songs, videoData.id, container);
  const streamToFile = await makeWriteStream(filePath);
  
  streamURL.pipe(streamToFile);
  return
});

app.post("/request", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "request");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const filePath = saveLocation(songs, videoData.id);
  
  if (!await checkFileExists(filePath)) {
    res.send({ error: true, comment: "File not Found!", isFile: false });
    return;
  }
  
  res.send({ error: false, comment: "File exists", isFile: true });
  return;
});

app.post('/songs', async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { res.send({ error: error, comment: comment }); }
  
  const filePath = saveLocation(songs, videoData.id);
  
  if (!await checkFileExists(filePath)) {
    res.send({ error: true, comment: "File not Found!" });
    return;
  }
  
  const readFile = await makeReadStream(filePath);
  
  readFile.pipe(res);
  
  return;
});

app.post("/parseSearchString", async (req, res) => {
  const { username, userId, inputQuery } = req.body;
  
  const { error, comment } = validQueries(username, userId, inputQuery, true);
  console.log({ error, comment }, "parseSearchString");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  let video = await youtube.getYoutubeData(inputQuery);
  
  return res.send(video);
});

app.post("/getDuration", async (req, res) => {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = validQueries(username, userId, videoData);
  console.log({ error, comment }, "getDuration");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const filePath = saveLocation(songs, videoData.id);
  const duration = await youtube.getVideoDurationInSeconds(filePath);
  
  res.send({ duration: duration, error: null });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});
