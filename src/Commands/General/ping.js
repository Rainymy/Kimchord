const handleRequests = require('../../Components/handleRequests.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

async function ping(message, basicInfo, searchString, queue, client) {
  const resmessage = await message.channel.send(messageInfo.pingAwait);
  
  if (!resmessage) {
    console.log({ resmessage });
    return message.channel.send(messageInfo.UNEXPECTED_ERROR);
  }
  
  const bot_username = client.user.username;
  
  const messageSentTime = Math.floor(message.createdTimestamp);
  const messageEditedTime = Math.floor(resmessage.createdTimestamp);
  
  const sendTime = Date.now();
  const response = await handleRequests.ping(sendTime);
  
  const processTime = response.time - sendTime;
  const responseTime = Date.now() - sendTime;
  
  const messagesText = codeBlock(
    [
      `${bot_username}'s ping: ${ messageEditedTime - messageSentTime }ms`,
      `Discord ping: ${ Math.floor(client.ws.ping) }ms`,
      `Backend processing time: ${isNaN(processTime) ? "❌" : `${processTime}ms`}`,
      `Response time: ${responseTime}ms`
    ].join("\n"), 
    "css"
  )
  
  return resmessage.edit(messagesText);
}

module.exports = {
  name: "Ping",
  aliases: [ "check", "ping"],
  main: ping
}