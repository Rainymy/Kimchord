"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components//embed/markup.js');
const { createAvatarEmbed } = require('../../Components/embed/formatToEmbed.js');

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
      codeBlock(
        "User not Found - use mention (@user) for accurate search", "java"
      )
    );
  }

  const embed = createAvatarEmbed(message.author);
  return await message.channel.send({ embeds: [ embed ] });
}

module.exports = {
  name: "Avatar",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "avatar",
  main: avatar
}
