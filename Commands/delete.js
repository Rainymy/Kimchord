const request = require('../Components/request.js');
const { parseSearchString } = require('../Components/parseSearchString.js');

async function deleteSong(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  
  const [param,, failed] = await parseSearchString(message, baseUrl, searchString);
  if (failed) {
    return message.channel.send("🆘 I could not obtain any search results. 🆘");
  }
  
  const data = await request(`${baseUrl}/remove`, param);
  
  if (!data.error) {
    return message.channel.send(data.comment);
  }
  
  if (data.comment.errno === (-4058)) {
    return message.channel.send("Doesn't exist");
  }
  
  console.log(data);
  return message.channel.send(`ERROR CODE: ${data.comment.errno.toString()}`);
}

module.exports = { name: "Delete", aliases: "delete", main: deleteSong }