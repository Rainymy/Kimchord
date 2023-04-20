"use strict";
const path = require('node:path');
const { makeWriteStream } = require("./handleFile.js");

async function logDownload(video, metadataBytes, downloadedBytes) {
  const totalBytes = Math.round(metadataBytes / 1024)
  const downloadBytes = Math.round(downloadedBytes / 1024);
  
  console.log("-----------------------------------------------------------");
  console.log(`logDownloadAmount:`);
  console.log(` ╠ ${video.title}`);
  console.log(` ╠ ${video.url}`);
  console.log(` ╚ ${totalBytes} / ${downloadBytes} KiB`);
  console.log("-----------------------------------------------------------");
  
  const savingText = [
    "----------------------------------------------------------------------",
    `${video.title}`,
    ` ╠ ${new Date().toLocaleString("sv-Sv") + " - HH:MM:SS"}`,
    ` ╚ ${video.url}\n`
  ].join("\n");
  
  const saveTextPath = path.join(__dirname, "../downloaded_songs.txt");
  const writeStream = await makeWriteStream(saveTextPath, { flags: "a+" });
  
  writeStream.write(savingText);
  writeStream.close();
  
  return;
}

module.exports = logDownload;