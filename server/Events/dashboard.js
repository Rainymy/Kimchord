"use strict";
const util = require('../Components/util.js').init();
const path = require('node:path');

async function dashboard(req, res, GLOBAL_OBJECTS) {
  const { fileManager, cookieManager } = GLOBAL_OBJECTS;
  // console.log(req.cookies);
  
  if (cookieManager.has(req.cookies.token)) {
    console.log("already cookied");
    cookieManager.get(req.cookies.token).reset_time();
    return res.sendFile(path.join(__dirname, "../HTML/dashboard.html"));
  }
  
  const userAgent = req.headers["user-agent"];
  const currentDate = new Date().toUTCString();
  const randomPseudoNumber = Math.random();
  
  const hash = util.createHash([ userAgent, currentDate, randomPseudoNumber ]);
  
  const timeout = (hashToken) => {
    const fn = (_) => {
      cookieManager.delete(_);
      // console.log("Token deleted.");
    }
    return setTimeout(fn, 1000 * 3, hashToken);
  }
  
  cookieManager.set(hash, {
    createdTime: new Date(),
    hash: hash,
    timeout_id: timeout(hash),
    reset_time: function () {
      clearTimeout(this.timeout_id);
      this.timeout_id = timeout(hash);
    }
  });
  
  res.cookie('token', hash, { maxAge: 24 * 60 * 60 * 1000 });
  return res.sendFile(path.join(__dirname, "../HTML/dashboard.html"));
}

module.exports = dashboard;

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