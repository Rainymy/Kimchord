const { durationToString } = require('../Components/formatToEmbed.js');

function createSongListEmbed(songs, start, perPages=8) {
  const offset = start === 0 ? 1 : 1;
  const page = songs.slice(start + offset, start + offset + perPages);
  const separatorLine = "".padStart(60, "-");
  
  const queuePlayLength = songs.reduce((acc, curr) => acc + curr.duration, 0);
  
  let embed;
  if (songs[0].type === "radio") {
    embed = {
      title: `📻🎶 Currently jaming to FM Radio 📻🎶`,
      color: 0x0099ff,
      description: songs[0].title,
      thumbnail: { url: songs[0].thumbnail },
      fields: []
    }
  }
  else {
    embed = {
      title: `Song Queue: ${durationToString(queuePlayLength)}`,
      color: 0x0099ff,
      description: "Current Song: " + songs[0].title,
      thumbnail: { url: songs[0].thumbnail },
      fields: []
    }
  }
  
  
  for (let [ index, item ] of page.entries()) {
    embed.fields.push({
      // name: "\u200B",
      name: separatorLine,
      value: `${index + start + offset} - ${item.title}`,
    });
  }
  
  return embed;
}

function createButton(label, id, disabled, emoji, buttonStyle) {
  return {
    type: "BUTTON",
    label: label,
    custom_id: id,
    style: buttonStyle ?? "SECONDARY",
    disabled: disabled,
    emoji: {
      animated: false,
      id: null,
      name: emoji ?? null
    }
  }
}

function createPageIndicator(songCount, current, perPage) {
  const pageCountNow = Math.floor(current / perPage) + 1;
  const lastPageCount = Math.ceil(songCount / perPage);
  
  const currentPage = createButton(pageCountNow, "currentPage", true);
  const pageSlash = createButton("/", "pageSlash", true);
  const lastPage = createButton(lastPageCount, "lastPage", true);
  
  return [ currentPage, pageSlash, lastPage ];
}

module.exports = {
  createSongListEmbed,
  createButton,
  createPageIndicator
}