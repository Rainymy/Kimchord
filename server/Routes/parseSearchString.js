"use strict";
const util = require('node:util');
const { PRESETS } = require('../Components/permission.js');

function formatLogData(data) {
  return util.inspect(data, { colors: true, depth: 2, maxArrayLength: 1 });
}

async function parseSearchString (req, res, GLOBAL_OBJECTS) {
  const { inputQuery } = req.body;
  const { youtube } = GLOBAL_OBJECTS
  
  const searchInput = youtube.removeTextFormat(inputQuery);
  
  console.log("------------------------------------------------------");
  console.log("Formating      :", inputQuery);
  console.log("Formated input :", searchInput);
  console.log("------------------------------------------------------");
  
  const video = await youtube.getYoutubeData(searchInput);
  
  if (video.length === 0) {
    console.log(`[ Failed to parse - ${searchInput}]`);
  }
  
  console.log("Parsed data: ", formatLogData(video));
  return res.send(video);
}

module.exports = {
  method: "post",
  route: "/parseSearchString",
  skipLoad: false,
  inputQuery: true,
  permissions: [
    PRESETS.PERMISSIONS.QUERY
  ],
  main: parseSearchString
};