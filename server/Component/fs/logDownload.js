"use strict";
async function logDownload(video, metadataBytes, downloadedBytes) {
  const totalBytes = Math.round(metadataBytes / 1024)
  const downloadBytes = Math.round(downloadedBytes / 1024);
  
  console.log("-----------------------------------------------------------");
  console.log(`logDownloadAmount:`);
  console.log(` ╠ ${video.title}`);
  console.log(` ╠ ${video.url}`);
  console.log(` ╚ ${totalBytes} / ${downloadBytes} KiB`);
  console.log("-----------------------------------------------------------");
  
  return;
}

module.exports = logDownload;