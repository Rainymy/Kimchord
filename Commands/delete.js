const request = require('../Components/request.js');

async function deleteSong(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  
  let options = {
    username: message.author.username,
    userId: message.author.id,
    inputQuery: searchString
  }
  
  let param = {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(options)
  }
  
  let video = await request(`${baseUrl}/parseSearchString`, param);
  if (!video) {
    return message.channel.send("🆘 I could not obtain any search results.");
  }
  
  options.videoData = video;
  param.body = JSON.stringify(options);
  
  let data = await request(`${baseUrl}/remove`, param);
  
  if (data.error) {
    if (data.comment.errno === (-4058)) {
      message.channel.send("Doesn't exist");
      return;
    }
    message.channel.send(`ERROR CODE: ${data.comment.errno.toString()}`);
    return;
  }
  
  message.channel.send(data.comment);
  
  return
}

module.exports = { name: "Delete", aliases: "delete", main: deleteSong }