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

const WebSocket = require('ws');
const express = require('express');
const app = express().disable("x-powered-by");

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

async function onServerStart() {
  GLOBAL_OBJECTS.fileManager = await fileManager.init();
  
  console.log(`Server listening at ${server.location}:${server.port}`);
  console.log(`Web UI at ${server.location}:${server.port}/dashboard`);
}

const createdServer = app.listen(server.port, onServerStart);
const wss = new WebSocket.Server({ server: createdServer, path: "/WS" });

wss.on('connection', function (ws) {
  console.log("New connection.");
  
  ws.send("hello client");
  
  ws.on('close', (code) => {
    console.log("Connection closed: ", code);
  });
  
  ws.on('message', (message) => {
    console.log("Connection established");
    console.log("Message received:", message.toString());
  });
});

wss.on('close', function () {
  return console.log("connection closed");
});

// connection.on("connection", function(socket) {
//   // console.log(socket);
// });