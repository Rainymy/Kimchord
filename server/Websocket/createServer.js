"use strict";
const WebSocket = require('ws');

function createServer(createdServer) {
  const wss = new WebSocket.Server({ server: createdServer, path: "/WS" });
  return wss;
}

module.exports = createServer;