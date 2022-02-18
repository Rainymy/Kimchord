async function ping(message, basicInfo, searchString, queue, client) {
  const text = 'Ping is being appreciated... :bar_chart:';
  const resmessage = await message.channel.send(text);
  
  const messageSentTime = Math.floor(message.createdTimestamp);
  const messageEditedTime = Math.floor(resmessage.createdTimestamp);
  
  resmessage.edit(`Kimchi's ping: **${ messageEditedTime - messageSentTime }ms**`);
  message.channel.send(`Discord ping: **${ Math.floor(client.ws.ping) }ms**`);
  
  return;
}

module.exports = {
  name: "Ping",
  aliases: [ "check", "ping"], 
  main: ping
}