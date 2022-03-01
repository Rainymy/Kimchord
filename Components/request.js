const http = require('http');
const { Readable } = require('stream');

// const fetch = (...args) => import('node-fetch')
// .then(({default: fetch}) => fetch(...args));

// async function request(httpURL, options) {
//   let response = await fetch(httpURL, options);
//   let clone = response.clone();
// 
//   async function handleJSON() {
//     return await new Promise(function(resolve, reject) {
//       clone.json()
//         .then(event => resolve(event))
//         .catch(e => resolve(null));
//     });
//   }
// 
//   async function preserveStream() { return response; }
// 
//   const result = await Promise.all([handleJSON(), preserveStream()]);
// 
//   if (!result[0]) { return result[1]; }
//   return result[0];
// }

function custom_request(urlPath, params) {
  const serverMeta = new URL(urlPath);
  
  const requestBody = params.body;
  
  const httpOption = {
    host: serverMeta.hostname,
    port: serverMeta.port,
    path: serverMeta.pathname,
    protocol: serverMeta.protocol,
    ...params
  }
  
  delete httpOption.body;
  
  return new Promise(function(resolve, reject) {
    const httpRequest = http.request(httpOption, (res) => {
      let chunks = [];
      
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        let bufferData = Buffer.concat(chunks);
        
        try { resolve(JSON.parse(bufferData)); }
        catch (e) {
          const readable = new Readable();
          readable.push(bufferData);
          readable.push(null);
          responseData = readable;
          resolve({ body: responseData });
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