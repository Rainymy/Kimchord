const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { parseSearchString } = require('../Components/parseSearchString.js');

async function searchVideo(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  const [, video, failed] = await parseSearchString(message, baseUrl, searchString);
  if (failed) {
    return message.channel.send("🆘 I could not obtain any search results. 🆘")
  }
  
  const [ container, embed ] = formatToEmbed(video[0], message, true);
  embed.description = "🔎 Found video 🔍";
  
  return message.channel.send(container);
}

module.exports = {
  name: "Search",
  aliases: ["search"],
  main: searchVideo
}