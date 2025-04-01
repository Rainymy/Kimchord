"use strict";
const { Readable } = require('node:stream');

function isObject(objVal) {
  return objVal && typeof objVal === 'object' && objVal.constructor === Object;
}

/**
* @param {String} string
* @param {String} pattern
* @returns
*/
function startsAndEndsWith(string, pattern) {
  return string.startsWith(pattern) && string.endsWith(pattern);
}

function createEmptyReadableStream() {
  const emptyStream = new Readable();
  emptyStream.push("");
  emptyStream.push(null);

  return emptyStream;
}

/**
*
* @param {String} str
* @param {Number?} fontSize
* @returns
*/
function measureText(str, fontSize = 10) {
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875,
    0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625,
    0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625,
    0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375,
    0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875,
    0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875,
    0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375,
    0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875,
    0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875,
    0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875,
    0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625,
    0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625
  ]
  const avg = 0.5279276315789471;
  return str
    .split('')
    .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
    .reduce((cur, acc) => acc + cur) * fontSize;
}

/**
* @param {String} customText
* @param {*} error
* @returns
*/
function printToTerminal(customText, error) {
  if (error.code === 50001) {
    return console.log("Disconnected by a user");
  }

  if (error.code === 50013) {
    return console.log("Has Timeout or MISSING_PERMISSIONS");
  }

  return console.log(customText, error.code, error);
}

module.exports = {
  isObject: isObject,
  startsAndEndsWith: startsAndEndsWith,
  createEmptyReadableStream: createEmptyReadableStream,
  measureText: measureText,
  printToTerminal: printToTerminal
}