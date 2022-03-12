const request = require('../Components/request.js');

async function ping(message, basicInfo, searchString, queue, client) {
  const text = 'Ping is being appreciated... :bar_chart:';
  const resmessage = await message.channel.send(text);
  
  if (!resmessage) {
    console.log({ resmessage });
    return message.channel.send("Something went Wrong");
  }
  
  const messageSentTime = Math.floor(message.createdTimestamp);
  const messageEditedTime = Math.floor(resmessage.createdTimestamp);
  
  const options = {
    method: "GET",
    headers: { "Content-type": "application/json" }
  }
  
  const baseUrl = basicInfo.serverURL;
  
  const sendTime = Date.now();
  const response = await request(`${baseUrl}/ping?time=${sendTime}`, options);
  
  const processTime = response.time - sendTime;
  const responseTime = Date.now() - sendTime;
  
  const messages = [
    `Kimchi's ping: **${ messageEditedTime - messageSentTime }ms**`,
    `Discord ping: **${ Math.floor(client.ws.ping) }ms**`,
    `Backend processing time: **${processTime}ms**`,
    `Response time: **${responseTime}ms**`
  ];
  
  return resmessage.edit(messages.join("\n"));
}

module.exports = {
  name: "Ping",
  aliases: [ "check", "ping"],
  category: "general",
  main: ping
}