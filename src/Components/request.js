"use strict";
const { PassThrough, Readable } = require('node:stream');
const got = (...args) => import('got').then(({ default: got }) => got(...args));

function isValidPassthrough(headers) {
  const transferEncoding = headers["transfer-encoding"];
  const contentType = headers["content-type"] ?? "";
  
  if (transferEncoding === "chunked" && 
      !contentType?.includes("application/json")) {
    return true;
  }
  
  if (contentType?.startsWith("audio/")) { return true; }
  if (contentType?.startsWith("video/")) { return true; }
  
  return false;
}

function got_request(urlPath, params) {
  const requestBody = params?.body ?? '{ "method": "get" }';
  const request_data = { json: JSON.parse(requestBody), ...params }
  
  if (request_data.method.toLowerCase() === "get") { delete request_data.json; }
  delete request_data.body;
  
  return new Promise(async function(resolve, reject) {
    try {
      const response = await got(urlPath, request_data);
      
      if (request_data.isStream) { return resolve(response); }
      
      if (isValidPassthrough(response.headers)) {
        const streamResponse = new PassThrough();
        const stream = Readable.from(response.rawBody);
        stream.pipe(streamResponse);
        
        return resolve(streamResponse);
      }
      
      try { resolve(JSON.parse(response.body)); }
      catch (e) { resolve({ error: true, comment: "Unparseable data" }); }
    }
    catch (e) {
      if (e.code === "ECONNREFUSED" || e.code === "ECONNRESET") {
        return resolve({ error: true, comment: "Server Down" });
      }
      
      console.log("catching error in \"got_request\":", e.message);
      return resolve({ error: true, comment: "Unknown Error" });
    }
  });
}

module.exports = got_request;