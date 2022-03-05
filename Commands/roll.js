function roll() {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return message.channel.send(`You rolled ${randomNumber}`);
}

module.exports = {
  name: "Now Playing",
  aliases: ["roll"],
  category: "fun",
  main: roll
}