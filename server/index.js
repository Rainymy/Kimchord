const { server } = require('../config.json');

const remove = require('./Events/remove.js');
const download = require('./Events/download.js');
const request = require('./Events/request.js');
const songsEvent = require('./Events/songsEvent.js');
const pingEvent = require('./Events/pingEvent.js');
const parseSearchString = require('./Events/parseSearchString.js');
const getDuration = require('./Events/getDuration.js');

const express = require('express');
const app = express();

const Youtube = require('./API/youtube.js');
const File_Manager = require('./Components/FileManager.js');
const fileManager = new File_Manager();

const GLOBAL_OBJECTS = {
  fileManager: null,
  youtube: new Youtube()
}

app.use(express.json());

app.get("/", async (req, res) => res.send("Main Page. Server working fine."));
app.post("/", async (req, res) => res.send("Main Page (POST)"));

app.post("/remove", async (req, res) => await remove(req, res, GLOBAL_OBJECTS));
app.post("/download", async (req, res) => await download(req, res, GLOBAL_OBJECTS));
app.post("/request", async (req, res) => await request(req, res, GLOBAL_OBJECTS));
app.post('/songs', async (req, res) => await songsEvent(req, res, GLOBAL_OBJECTS));
app.get("/ping", async (req, res) => await pingEvent(req, res, GLOBAL_OBJECTS));

app.post("/parseSearchString", async (req, res) => {
  return await parseSearchString(req, res, GLOBAL_OBJECTS);
});

app.post("/getDuration", async (req, res) => {
  return await getDuration(req, res, GLOBAL_OBJECTS);
});

app.listen(server.port, async () => {
  GLOBAL_OBJECTS.fileManager = await fileManager.init();
  
  console.log(`Server listening at ${server.location}:${server.port}`);
});
