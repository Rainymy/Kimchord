"use strict";
const { server } = require('../config.json');

const connectionWS = require('./Web/Websocket/connection.js');
const createServerWS = require('./Web/Websocket/createServer.js');
const closeConnectionWS = require('./Web/Websocket/close.js');

const chalk = require('chalk');
const express = require('express');
const app = express().disable("x-powered-by");
const setMiddlewares = require('./Web/Component/setMiddlewares.js');
setMiddlewares(app, server);

const { getAllRoute, loadAllRoutes } = require('./Component/startup/handleRoute.js');
const { getSaveLocation, getFileCount } = require('./Component/util/util.js');
const baseFolder = getSaveLocation();

const Youtube = require('./API/youtube.js');
const File_Manager = require('./Component/fs/FileManager.js');
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
  console.log("Basic Info");
  console.log("╠ Base save folder :", chalk.yellow(baseFolder));
  console.log("╚ Load song count  :", getFileCount());
  console.log("------------------------------------------------------");
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
