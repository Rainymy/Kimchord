const https = require('https');

function getPlaylistId(urlString) {
  let parseSearchURL;
  try { parseSearchURL = new URL(urlString); } 
  catch (e) { parseSearchURL = null; }
  if (!parseSearchURL) { return; }
  
  if (parseSearchURL.pathname !== "/playlist") { return; }
  
  const url = new URLSearchParams(parseSearchURL.search);
  const playListId = url.get("list");
  return playListId;
}

async function getBasicInfo(videoUrl) {
  return new Promise(function(resolve, reject) {
    const baseUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`;
    const nativeHttps = https.get(baseUrl, (res) => {
      let data = "";
      
      res.on("data", (chunk) => { return data += chunk; });
      res.on("end", () => {
        let info; 
        try { info = JSON.parse(data); }
        catch (e) { info = data; }
        
        const response = typeof info === "string" ? { title: info } : info;
        
        if (info === "Not Found") { return resolve(); }
        if (info === "Bad Request") { return resolve(); }
        if (typeof info !== "string") { return resolve(response); }
        
        return resolve({ title: info });
      });
    });
    
    nativeHttps.on("error", (err) => reject(err));
  });
}

module.exports = { getBasicInfo, getPlaylistId }