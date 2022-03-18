const request = require('../Components/request.js');
const messageInfo = require('../Components/messageInfo.js');
const { codeBlock } = require('../Components/markup.js');

async function ping(message, basicInfo, searchString, queue, client) {
  const resmessage = await message.channel.send(messageInfo.pingAwait);
  
  if (!resmessage) {
    console.log({ resmessage });
    return message.channel.send(messageInfo.UNEXPECTED_ERROR);
  }
  
  const messageSentTime = Math.floor(message.createdTimestamp);
  const messageEditedTime = Math.floor(resmessage.createdTimestamp);
  
  const options = { method: "GET", headers: { "Content-type": "application/json" } }
  const baseUrl = basicInfo.serverURL;
  
  const sendTime = Date.now();
  const response = await request(`${baseUrl}/ping?time=${sendTime}`, options);
  
  const processTime = response.time - sendTime;
  const responseTime = Date.now() - sendTime;
  
  const messages = [
    `Kimchi's ping: ${ messageEditedTime - messageSentTime }ms`,
    `Discord ping: ${ Math.floor(client.ws.ping) }ms`,
    `Backend processing time: ${processTime}ms`,
    `Response time: ${responseTime}ms`
  ];
  
  return resmessage.edit(codeBlock(messages.join("\n"), "css"));
}

module.exports = {
  name: "Ping",
  aliases: [ "check", "ping"],
  category: "general",
  main: ping
}