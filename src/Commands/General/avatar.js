const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function createAvatarEmbed(message, target) {
  if (!target) { target = message; }
  
  return {
    color: 0x0099ff,
    title: `${target.username}'s Avatar`,
    image: { url: target.displayAvatarURL({ dynamic: true, size: 1024 }) },
    footer: {
      text: `Requested by: ${message.username}`,
      icon_url: `${message.displayAvatarURL({ dynamic: true })}`
    }
  }
}

async function avatar(message, basicInfo, arg, queue, client) {
  const targetMember = message.mentions.members.first();
  if (targetMember) {
    const embed = createAvatarEmbed(message.author, targetMember.user);
    return await message.channel.send({ embeds: [ embed ] });
  }
  
  const fetchedUser = message.guild.members.cache.get(arg);
  if (fetchedUser && parseInt(arg).toString().length === 18) {
    const embed = createAvatarEmbed(message.author, fetchedUser.user);
    return await message.channel.send({ embeds: [ embed ] });
  }
  
  const userWithName = client.users.cache.find(user => user.username === arg);
  if (userWithName) {
    const embed = createAvatarEmbed(message.author, userWithName);
    return await message.channel.send({ embeds: [ embed ] });
  }
  
  if (arg) {
    return message.channel.send(
      codeBlock("User not Found - use mention (@user) for accurate search", "java")
    );
  }
  
  const embed = createAvatarEmbed(message.author);
  return await message.channel.send({ embeds: [ embed ] });
}

module.exports = {
  name: "Avatar",
  aliases: "avatar",
  main: avatar
}