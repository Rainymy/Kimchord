"use strict";
const { durationToString } = require('../util/timeUtil.js');
const { basicEmbed } = require('./formatToEmbed.js');
const {
  ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder,
  ButtonStyle
} = require('discord.js');

/**
* @param {Array<Object>} songs
* @param {Number} start
* @param {Number} perPages
* @returns
*/
function createSongListEmbed(songs, start, perPages = 8) {
  if (!songs.length) { return; }

  const page = songs.slice(start + 1, start + 1 + perPages);
  const separatorLine = "".padStart(60, "-");

  const queuePlayLength = songs.reduce((acc, curr) => acc + curr.duration, 0);
  const embed = basicEmbed(songs[0], queuePlayLength);

  for (let [index, item] of page.entries()) {
    embed.fields.push({
      // name: "\u200B",
      name: separatorLine,
      value: `${index + start + 1} - ${item.title}`,
    });
  }

  return embed;
}

function createQueueButtons(components) {
  const wrapper = new ActionRowBuilder();

  for (let component of components) {
    wrapper.addComponents(component);
  }

  return wrapper;
}

function createDropdown(options) {
  const menu_builder = new StringSelectMenuBuilder();
  const menu = new ActionRowBuilder();

  menu.addComponents(
    menu_builder
      .setCustomId('select')
      .setPlaceholder("Choose a category")
      .setCustomId("select_menu")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(options),
  );

  return menu;
}

/**
*
* @param {Number|String} label
* @param {String} id
* @param {Boolean} disabled
* @param {String=} emoji
* @param {ButtonStyle=} buttonStyle
* @returns
*/
function createButton(label, id, disabled, emoji, buttonStyle) {
  const buttons = new ButtonBuilder();

  buttons
    .setLabel(label.toString())
    .setCustomId(id)
    .setStyle(buttonStyle ?? ButtonStyle.Secondary)
    .setDisabled(disabled);

  return buttons;
}

/**
* @param {Number} songCount
* @param {Number} current
* @param {Number} perPage
* @returns
*/
function createPageIndicator(songCount, current, perPage) {
  const pageCountNow = Math.floor(current / perPage) + 1;
  const lastPageCount = Math.ceil(songCount / perPage);

  const currentPage = createButton(pageCountNow, "currentPage", true);
  const pageSlash = createButton("/", "pageSlash", true);
  const lastPage = createButton(lastPageCount, "lastPage", true);

  return [currentPage, pageSlash, lastPage];
}

module.exports = {
  createSongListEmbed: createSongListEmbed,
  createButton: createButton,
  createPageIndicator: createPageIndicator,
  createDropdown: createDropdown,
  createQueueButtons: createQueueButtons
}
