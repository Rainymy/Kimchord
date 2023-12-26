"use strict";
const path = require('node:path');

async function dashboard(req, res, GLOBAL_OBJECTS) {
  const { fileManager, cookieManager } = GLOBAL_OBJECTS;
  
  return res.sendFile(path.join(__dirname, "../HTML/dashboard.html"));
}

module.exports = {
  method: "get",
  route: "/dashboard",
  skipLoad: false,
  permissions: [],
  main: dashboard
};

// GLOBAL_OBJECTS.fileManager.events.on("downloading", data => {
//   console.log("downloading", data);
// });
// 
// GLOBAL_OBJECTS.fileManager.events.on("downloaded", data => {
//   console.log("downloaded", data);
// });
// 
// GLOBAL_OBJECTS.fileManager.events.on("finished", data => {
//   console.log("finished", data);
// });