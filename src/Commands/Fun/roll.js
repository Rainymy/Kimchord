function roll(message, basicInfo, arg, queue) {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return message.channel.send(`You rolled ${randomNumber}`);
}

module.exports = {
  name: "Roll 1-100",
  aliases: ["roll"],
  main: roll
}