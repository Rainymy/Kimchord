const request = require('./request.js');

async function parseSearchString(message, baseUrl, searchString) {
  const request_object = {
    username: message.author.username,
    userId: message.author.id,
    inputQuery: searchString,
    videoData: undefined
  }
  
  // 1024 * 1024 * 124 => 124 MB
  const param = {
    highWaterMark: 1024 * 1024 * 124,
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(request_object)
  }
  
  const video = await request(`${baseUrl}/parseSearchString`, param);
  
  if (!video) {
    return [ null, null, true ];
  }
  request_object.videoData = video;
  
  param.body = JSON.stringify(request_object);
  return [ param, video, false ];
}

module.exports = { parseSearchString: parseSearchString }