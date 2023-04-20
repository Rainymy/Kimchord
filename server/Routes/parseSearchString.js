"use strict";
const { PRESETS } = require('../Components/permission.js');

async function parseSearchString (req, res, GLOBAL_OBJECTS) {
  const { inputQuery } = req.body;
  
  const video = await GLOBAL_OBJECTS.youtube.getYoutubeData(inputQuery);
  
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