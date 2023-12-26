"use strict";
const fs = require('node:fs');
const path = require('node:path');

const eventHandler = require('./Components/eventHandler.js');

const CUSTOM_CODE_TYPE = {
  FILE_TRANSFER_COMPLETE: 3000,
  EXISTING_FILE_CONNECTION: 3001
}

function connection(wss, ws) {
  console.log("New connection.");
  
  ws.on('close', (code) => {
    if (code === CUSTOM_CODE_TYPE.FILE_TRANSFER_COMPLETE) { return; }
    if (code === CUSTOM_CODE_TYPE.EXISTING_FILE_CONNECTION) { return; }
    
    console.log("Connection closed: ", code);
  });
  
  ws.on('message', async (message) => {
    return await eventHandler(wss, ws, message);
  });
}

module.exports = connection;