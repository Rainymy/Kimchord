"use strict";
const { server } = require('../config.json');

const connectionWS = require('./Websocket/connection.js');
const createServerWS = require('./Websocket/createServer.js');
const closeConnectionWS = require('./Websocket/close.js');

const chalk = require('chalk');
const express = require('express');
const app = express().disable("x-powered-by");
const setMiddlewares = require('./Components/setMiddlewares.js');
setMiddlewares(app);

const { getAllRoute, loadAllRoutes } = require('./Components/handleRoute.js');
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

const routes = getAllRoute();
loadAllRoutes(app, routes, GLOBAL_OBJECTS);

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