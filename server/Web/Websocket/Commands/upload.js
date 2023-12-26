"use strict";
const fs = require('node:fs');
const path = require('node:path');

const files = new Map();

async function uploadFile(wss, ws, message) {
  if (!files.has(message.name)) {
    files.set(message.name, { path: message.path ?? null, data: [] });
  }
  
  const file = files.get(message.name);
  
  file.data.push(Buffer.from(message.data));
  
  if (message.isDone) {
    const bufferData = Buffer.concat(file.data);
    console.log("Received data: ", bufferData);
    // console.log(bufferData.toString());
    
    // const zipFile = path.join(__dirname, "./test.zip");
    // fs.writeFileSync(zipFile, bufferData, { flag: "a+" });
    
    if (file.path) {
      // const filePath = path.join(file.path, file.name)
      // createWriteStream(filePath, file.data);
    }
    
    return console.log("Transfer complete!");
  }
  
  ws.send(JSON.stringify([ "upload", message.name ]));
  
  return;
}

module.exports = {
  event: "upload",
  main: uploadFile
}