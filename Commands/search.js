const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { parseSearchString } = require('../Components/parseSearchString.js');

async function searchVideo(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  const [ , video, ] = await parseSearchString(message, baseUrl, searchString);
  if (!video) {
    return message.channel.send("🆘 I could not obtain any search results. 🆘")
  }
  
  const [ container, embed ] = formatToEmbed(video, message, true);
  embed.description = "🔎 Found video 🔍";
  
  message.channel.send(container);
  return;
}

module.exports = {
  name: "Search",
  aliases: ["search"],
  main: searchVideo
}