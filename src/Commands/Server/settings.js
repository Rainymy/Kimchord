const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');
const { saveServerData } = require('../../Components/serverData.js');
const {
  PRESETS,
  validateUserPermissions
} = require('../../Components/permissions.js');

function helpText(serverPrefix, settingsName) {
  if (settingsName === "prefix") {
    return `${serverPrefix}settings ${settingsName} <PREFIX>`
  }
  
  if (settingsName === "required_music_role_name") {
    return `${serverPrefix}settings ${settingsName} <ROLE NAME>`
  }
  
  if (settingsName === "require_music_role") {
    return `${serverPrefix}settings ${settingsName} <True|False>`
  }
  
  return `${serverPrefix}settings <SETTINGS NAME> <VALUE>`;
}

async function settings(message, basicInfo, arg, queue) {
  const batch = [];
  const availableSettings = [
    "prefix", "required_music_role_name", "require_music_role"
  ];
  
  for (let [ index, setting ] of availableSettings.entries()) {
    batch.push(`╠ ${index + 1}. ${setting}`);
  }
  
  if (!arg) {
    return message.channel.send(
      codeBlock(
        [ `Available settings are: `, `${ batch.join("\n") }` ].join("\n"),
        "scala"
      )
    );
  }
  
  const hasPermission = validateUserPermissions(message.member, PRESETS.server_mods);
  if (hasPermission.error) { return message.channel.send(hasPermission.comment); }
  
  const args = arg.trim().split(" ");
  const settingsName = args.shift().toLowerCase().trim();
  const searchString = args.join(" ").trim();
  
  if (settingsName === "prefix") {
    if (!searchString) {
      return message.channel.send(
        codeBlock(
          [
            `Current prefix: ${basicInfo.prefix}`,
            helpText(basicInfo.prefix, settingsName)
          ].join("\n"),
          "html"
        )
      );
    }
    
    const data = basicInfo.guilds_settings;
    data.prefix = searchString;
    
    basicInfo.all_server_settings.set(message.guild.id, data);
    await saveServerData(message.guild.id, data);
    return message.channel.send(
      codeBlock(`Server prefix changed to: ${searchString}`)
    );
  }
  
  if (settingsName === "required_music_role_name") {
    if (!searchString) {
      return message.channel.send(
        codeBlock(
          [
            `Current value: ${basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME}`,
            helpText(basicInfo.prefix, settingsName)
          ].join("\n"),
          "html"
        )
      );
    }
    
    if (searchString === basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME) {
      return message.channel.send(
        codeBlock(
          `Already saved: ${basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME}`, "py"
        )
      );
    }
    
    const data = basicInfo.guilds_settings;
    data["required_music_role_name".toUpperCase()] = searchString;
    
    basicInfo.all_server_settings.set(message.guild.id, data);
    await saveServerData(message.guild.id, data);
    
    return message.channel.send(
      codeBlock(`Required_music_role_name changed to: ${searchString}`)
    );
  }
  
  if (settingsName === "require_music_role") {
    if (!searchString) {
      return message.channel.send(
        codeBlock(
          [
            `Current value: ${basicInfo.guilds_settings.REQUIRE_MUSIC_ROLE}`,
            helpText(basicInfo.prefix, settingsName)
          ].join("\n"),
          "py"
        )
      );
    }
    
    let trueOrFalse;
    if (searchString === "true") { trueOrFalse = true; }
    if (searchString === "false") { trueOrFalse = false; }
    if (typeof trueOrFalse !== "boolean") {
      return message.channel.send(
        codeBlock(helpText(basicInfo.prefix, settingsName), "py")
      );
    }
    
    if (trueOrFalse === basicInfo.guilds_settings.REQUIRE_MUSIC_ROLE) {
      return message.channel.send(
        codeBlock(
          `Already saved: ${basicInfo.guilds_settings.REQUIRE_MUSIC_ROLE}`, "py"
        )
      );
    }
    
    const data = basicInfo.guilds_settings;
    data["require_music_role".toUpperCase()] = trueOrFalse;
    
    basicInfo.all_server_settings.set(message.guild.id, data);
    await saveServerData(message.guild.id, data);
    
    return message.channel.send(
      codeBlock(`Required_music_role_name changed to: ${searchString}`)
    );
  }
  
  return message.channel.send(
    codeBlock(
      [ helpText(basicInfo.prefix), `${batch.join("\n")}` ].join("\n"),
      "scala" 
    )
  );
}

module.exports = {
  name: "Settings",
  aliases: "settings",
  main: settings
};