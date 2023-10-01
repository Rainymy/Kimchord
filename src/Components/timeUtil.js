"use strict";
const HOUR = 2;
const MINUTE = 1;
const SECOND = 0;

function durationToString(durationInSeconds = 0) {
  const hours = Math.floor(durationInSeconds / 60 / 60).toString().padStart(2, 0);
  const minutes = Math.floor((durationInSeconds/60) % 60).toString().padStart(2, 0);
  const seconds = Math.floor(durationInSeconds % 60).toString().padStart(2, 0);
  
  return `${hours}:${minutes}:${seconds}`;
}

function stringToDurationSeconds(durationInString = "") {
  // Number(<false value>) returns 0
  const inputSeconds = Number(durationInString);
  if (isNaN(inputSeconds)) { return; }
  
  return { second: inputSeconds };
}

function convertTimeFormatToSeconds(time) {
  const seconds = time?.second ?? 0;
  const minuteInSeconds = (time?.minute ?? 0) * 60;
  const hourInSeconds = (time?.hour ?? 0) * 60 * 60;
  
  return seconds + minuteInSeconds + hourInSeconds;
}

function parseStringTimeFormatHHMMSS(time = "") {
  const parts = time.split(":").reverse();
  
  const hours = Number(parts[HOUR] ?? 0);
  const minutes = Number(parts[MINUTE] ?? 0);
  const seconds = Number(parts[SECOND] ?? 0);
  
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) { return; }
  
  return { hour: hours, minute: minutes, second: seconds }
}

function validateTime(input) {
  // input is absolute time HH:MM:SS
  if (input.includes(":")) {
    const parsed = parseStringTimeFormatHHMMSS(input);
    const time = convertTimeFormatToSeconds(parsed)
    
    return { failed: !parsed, time: time, relative: false }
  }
  
  const parsed = stringToDurationSeconds(input);
  return { failed: !parsed, time: parsed?.second ?? 0, relative: true };
}

module.exports = {
  durationToString: durationToString,
  stringToDurationSeconds: stringToDurationSeconds,
  validateTime: validateTime
}