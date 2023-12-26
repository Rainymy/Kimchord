"use strict";
const util = require('./util.js').init();

const PRESETS = {
  PERMISSIONS: {
    QUERY: "query"
  }
}

function checkPermission(route, body) {
  for (let permission of route.permissions ?? []) {
    if (permission === PRESETS.PERMISSIONS.QUERY) {
      const { username, userId } = body;
      
      const query = body?.inputQuery ?? body?.videoData;
      const isStringQuery = route?.inputQuery ?? false;
      
      return util.validQueries(username, userId, query, isStringQuery);
    }
  }
  
  return { error: false, comment: null }
}

module.exports = {
  PRESETS: PRESETS,
  checkPermission: checkPermission
}