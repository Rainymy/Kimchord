const request = require('./request.js');
const { isObject } = require('./util.js');

async function parseSearchString(message, baseUrl, searchString) {
  const request_object = {
    username: message.author.username,
    userId: message.author.id,
    inputQuery: searchString,
    videoData: undefined
  }
  
  const param = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(request_object)
  }
  
  const response = await request(`${baseUrl}/parseSearchString`, param);
  if (response.error) { return [ null, null, true ]; }
  
  let video;
  
  if (response.type === "playlist") { video = response; }
  else if (isObject(response)) { video = [ response ]; }
  
  if (!video || (!isObject(video) && !video?.length)) {
    return [ null, null, true ];
  }
  request_object.videoData = video;
  
  delete request_object.inputQuery;
  
  param.body = JSON.stringify(request_object);
  return [ param, video, false ];
}

module.exports = { parseSearchString: parseSearchString }