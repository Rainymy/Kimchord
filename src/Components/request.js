const http = require('http');
const https = require('https');
const { PassThrough } = require('stream');

function isValidPassthrough(headers) {
  const transferEncoding = headers["transfer-encoding"];
  const contentType = headers["content-type"] ?? "";
  
  if (transferEncoding === "chunked" && !contentType?.includes("application/json")) {
    return true;
  }
  
  if (contentType?.startsWith("audio/")) { return true; }
  if (contentType?.startsWith("video/")) { return true; }
  
  return false;
}

function custom_request(urlPath, params) {
  const serverMeta = new URL(urlPath);
  const requestBody = params?.body ?? "";
  
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
      
      let chunks = [];
      let bytes = 0;
      
      res.on("data", (chunk) => {
        bytes += chunk.length / 1024;
        chunks.push(chunk);
        if (bytes > 512) {
          console.log("Request Chunk getting bigger. Look for: ", urlPath);
        }
      });
      
      res.on("end", () => {
        let bufferData = Buffer.concat(chunks);
      
        try { resolve(JSON.parse(bufferData)); }
        catch (e) {
          resolve({
            error: true,
            body: bufferData.toString(),
            comment: e.toString()
          });
        }
      
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

module.exports = custom_request;