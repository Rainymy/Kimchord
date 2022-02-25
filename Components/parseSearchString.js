const request = require('./request.js');

function isObject(objValue) {
  return objValue && typeof objValue === 'object' 
                  && objValue.constructor === Object;
}

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
  
  const response = await request(`${baseUrl}/parseSearchString`, param);
  let video;
  
  if (response.type === "playlist" || response.length) {
    video = response;
  }
  
  if (isObject(response)) {
    video = response.type === "playlist" ? response : [ response ];
  }
  
  if ((video.length === 0) || !video) {
    return [ null, null, true ];
  }
  request_object.videoData = video;
  
  param.body = JSON.stringify(request_object);
  return [ param, video, false ];
}

module.exports = { parseSearchString: parseSearchString }