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

const Cookies = require('./Components/Cookies.js');
const cacheSongs = require("./Components/cacheSongs.js");

const { parseLocalFolder } = require("./Components/handleFile.js");

const GLOBAL_CONSTANTS = {
  songs: parseLocalFolder(),
  cacheSongs: cacheSongs,
  cookies: {}
}

app.use(express.json());

app.get("/", (req, res) => res.send("Main Page. Server working fine."));
app.post("/", (req, res) => res.send("Main Page (POST)"));

app.post("/remove", async (req, res) => await remove(req, res, GLOBAL_CONSTANTS));
app.post("/download", async (req, res) => await download(req, res, GLOBAL_CONSTANTS));
app.post("/request", async (req, res) => await request(req, res, GLOBAL_CONSTANTS));
app.post('/songs', async (req, res) => await songsEvent(req, res, GLOBAL_CONSTANTS));
app.get("/ping", async (req, res) => await pingEvent(req, res, GLOBAL_CONSTANTS));

app.post("/parseSearchString", async (req, res) => {
  return await parseSearchString(req, res, GLOBAL_CONSTANTS);
});

app.post("/getDuration", async (req, res) => {
  return await getDuration(req, res, GLOBAL_CONSTANTS);
});

app.listen(server.port, async () => {
  GLOBAL_CONSTANTS.cookies = await Cookies.get();
  console.log(`Server listening at http://localhost:${server.port}`);
});
