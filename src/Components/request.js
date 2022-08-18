"use strict";
const http = require('node:http');
const https = require('node:https');
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

function custom_request(urlPath, params) {
  const serverMeta = new URL(urlPath);
  const requestBody = params?.body ?? "";
  const THRESHOLD_KB = 512;
  
  const httpOption = {
    host: serverMeta.hostname,
    port: serverMeta.port,
    path: serverMeta.pathname,
    protocol: serverMeta.protocol,
    ...params
  }
  
  delete httpOption.body;
  
  let communication;
  if (serverMeta.protocol === "https:") { communication = https; }
  if (serverMeta.protocol === "http:") { communication = http; }
  if (!communication) {
    return Promise.resolve({ error: true, comment: "Invalid protocol!" });
  }
  
  return new Promise(function(resolve, reject) {
    const httpRequest = communication.request(httpOption, (res) => {
      if (isValidPassthrough(res.headers)) {
        const streamResponse = new PassThrough();
        res.pipe(streamResponse);
        return resolve(streamResponse);
      }
      
      const chunks = [];
      
      res.on("data", (chunk) => {
        chunks.push(chunk);
        
        // chunks.length * chunk kilobyte > limit kilobyte
        if (chunks.length * (chunk.length / 1024) > THRESHOLD_KB) {
          console.log("Request Chunk getting bigger.", urlPath);
        }
      });
      
      res.on("end", () => {
        const bufferData = Buffer.concat(chunks);
        
        try { resolve(JSON.parse(bufferData)); }
        catch (e) { resolve({ error: true, comment: "Unparseable data" }); }
      });
    });
    
    httpRequest.on("error", (error) => {
      console.log("Error from http: ", error);
      resolve({ error: true, comment: error });
    });
    
    httpRequest.write(requestBody);
    httpRequest.end();
  });
}

function got_request(urlPath, params) {
  const requestBody = params?.body ?? "{}";
  const THRESHOLD_KB = 512;
  
  const request_data = {
    json: JSON.parse(requestBody),
    ...params
  }
  
  if (request_data.method.toLowerCase() === "get") { delete request_data.json; }
  
  delete request_data.body;
  
  return new Promise(async function(resolve, reject) {
    try {
      const response = await got(urlPath, request_data);
      
      if (isValidPassthrough(response.headers)) {
        const streamResponse = new PassThrough();
        const stream = Readable.from(response.rawBody);
        stream.pipe(streamResponse);
        
        response.pipe(streamResponse);
        
        return resolve(streamResponse);
      }
      
      try { resolve(JSON.parse(response.body)); }
      catch (e) { resolve({ error: true, comment: "Unparseable data" }); }
    }
    catch (e) {
      console.log(e);
      return resolve({ error: true, comment: e });
    }
  });
}

module.exports = got_request;
// module.exports = custom_request;