const { durationToString } = require('../Components/formatToEmbed.js');

function progressBar(lineLength, progressPercent, indicator="🔥", line="-") {
  let progressText = "".padStart(lineLength, line).split("");
  
  progressText[Math.floor(progressText.length * progressPercent)] = indicator
  progressText = progressText.join("");
  
  return progressText;
}

function makeTextBar(timePlayed, duration, progress) {
  const readableTimeLeft = durationToString(timePlayed);
  const readableDuration = durationToString(duration);
  
  return `${readableTimeLeft} |${progress}| ${readableDuration}`;
}

module.exports = {
  progressBar: progressBar,
  makeTextBar: makeTextBar
}