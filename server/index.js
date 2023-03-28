"use strict";
const { server } = require('../config.json');

const remove = require('./Events/remove.js');
const download = require('./Events/download.js');
const request = require('./Events/request.js');
const songsEvent = require('./Events/songsEvent.js');
const pingEvent = require('./Events/pingEvent.js');
const parseSearchString = require('./Events/parseSearchString.js');
const getDuration = require('./Events/getDuration.js');
const dashboard = require('./Events/dashboard.js');

const connectionWS = require('./Websocket/connection.js');
const createServerWS = require('./Websocket/createServer.js');
const closeConnectionWS = require('./Websocket/close.js');

const chalk = require('chalk');
const express = require('express');
const app = express().disable("x-powered-by");
const setMiddlewares = require('./Components/setMiddlewares.js');
setMiddlewares(app);

const { getSaveLocation } = require('./Components/util.js');
const baseFolder = getSaveLocation();

const Youtube = require('./API/youtube.js');
const File_Manager = require('./Components/FileManager.js');
const fileManager = new File_Manager();

const GLOBAL_OBJECTS = {
  fileManager: null,
  youtube: new Youtube(),
  cookieManager: new Map()
}

app.get("/", async (req, res) => res.send("Main Page. Server working fine."));
app.post("/", async (req, res) => res.send("Main Page (POST)"));

app.post("/remove", async (req, res) => await remove(req, res, GLOBAL_OBJECTS));
app.post("/download", async (req, res) => await download(req, res, GLOBAL_OBJECTS));
app.post("/request", async (req, res) => await request(req, res, GLOBAL_OBJECTS));
app.post('/songs', async (req, res) => await songsEvent(req, res, GLOBAL_OBJECTS));
app.get("/ping", async (req, res) => await pingEvent(req, res, GLOBAL_OBJECTS));
app.get("/dashboard", async (req, res) => await dashboard(req, res, GLOBAL_OBJECTS));

app.post("/parseSearchString", async (req, res) => {
  return await parseSearchString(req, res, GLOBAL_OBJECTS);
});

app.post("/getDuration", async (req, res) => {
  return await getDuration(req, res, GLOBAL_OBJECTS);
});

async function onServerStart() {
  console.log("------------------------------------------------------");
  console.log("Base save folder :", chalk.yellow(baseFolder));
  GLOBAL_OBJECTS.fileManager = await fileManager.init(baseFolder);
  
  const listenURL = `${server.location}:${server.port}`;
  const webURL = `${listenURL}/dashboard`;
  console.log("------------------------------------------------------");
  console.log(`Server listening at ${chalk.cyanBright(listenURL)}`);
  console.log(`Web UI at ${chalk.cyanBright(webURL)}`);
  console.log("------------------------------------------------------");
}

const createdServer = app.listen(server.port, onServerStart);
const wss = createServerWS(createdServer);

wss.on('connection', async (ws) => { await connectionWS(wss, ws); });
wss.on('close', () => { return closeConnectionWS(); });