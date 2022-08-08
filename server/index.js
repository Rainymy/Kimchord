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

const express = require('express');
const app = express().disable("x-powered-by");

const WebSocket = require('ws');

const Youtube = require('./API/youtube.js');
const File_Manager = require('./Components/FileManager.js');
const fileManager = new File_Manager();

const setMiddlewares = require('./Components/setMiddlewares.js');

const GLOBAL_OBJECTS = {
  fileManager: null,
  youtube: new Youtube(),
  cookieManager: new Map()
}

setMiddlewares(app);

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

app.post("/API", async (req, res) => {
  const { fileManager, cookieManager } = GLOBAL_OBJECTS;
  console.log("/API :", req.cookies.token);
  
  if (!cookieManager.has(req.cookies.token)) {
    return res.send({ ok: false, comment: "Expired cookie token." })
  }
  
  return res.send({ ok: true });
});

const createdServer = app.listen(server.port, async () => {
  GLOBAL_OBJECTS.fileManager = await fileManager.init();
  
  console.log(`Server listening at ${server.location}:${server.port}`);
});

const wss = new WebSocket.Server({ server: createdServer, path: "/WS"});
wss.on('connection', function (ws) {
  console.log("New connection.");
  
  ws.send("hello client");
  
  console.log(ws.isAlive);
  
  // const interloop = setInterval(function () {
  //   if (ws.isAlive === false) { return ws.terminate(); }
  // }, 3000);
  
  ws.on('close', (code) => {
    console.log("Connection closed: ", code);
  });
  
  ws.on('message', (message) => {
    console.log("Connection established");
    // console.log("Message received:", message.toString());
  });
});

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    console.log("hello");
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 1000);

wss.on('close', function close() {
  clearInterval(interval);
});

// connection.on("connection", function(socket) {
//   // console.log(socket);
// });