const { Constants } = require('discord.js');

function isObject(objVal) {
  return objVal && typeof objVal === 'object' && objVal.constructor === Object;
}

function validateCommand(command, prefix) {
  return command.startsWith(prefix) && command.length > prefix.length;
}

function measureText(str, fontSize = 10) {
  const widths = [
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,
    0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,
    0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,
    0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,
    0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,
    0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,
    0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,
    0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,
    0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,
    0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,
    0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,
    0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,
    0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625
  ]
  const avg = 0.5279276315789471;
  return str
    .split('')
    .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
    .reduce((cur, acc) => acc + cur) * fontSize;
}

async function count_performance(tries = 100, cb) {
  let totalRuns = [];
  let timer;
  for (let i = 0; i < tries; i++) {
    timer = performance.now();
    await cb();
    totalRuns.push(performance.now() - timer);
  }
  
  const sortedArray = totalRuns.sort((a, b) => { return b - a; });
  const totalTime = sortedArray.reduce((acc, curr) => { return acc + curr; }, 0);
  
  return {
    max: sortedArray[0], 
    min: sortedArray[sortedArray.length - 1],
    avg: totalTime / sortedArray.length,
    data: sortedArray 
  };
}

function durationToString(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 60 / 60).toString().padStart(2, 0);
  const minutes = Math.floor((durationInSeconds/60) % 60).toString().padStart(2, 0);
  const seconds = Math.round(durationInSeconds % 60).toString().padStart(2, 0);
  
  return `${hours}:${minutes}:${seconds}`;
}

function printToTerminal(customText, error) {
  // console.log(Constants);
  // if (error.code === Constants.APIErrors.MISSING_ACCESS) {
  //   return console.log("Kicked from server or MISSING_ACCESS");
  // }
  // 
  // if (error.code === Constants.APIErrors.MISSING_PERMISSIONS) {
  //   return console.log("Has Timeout or MISSING_PERMISSIONS");
  // }
  
  console.log(customText, error.code, error); 
}

module.exports = {
  isObject: isObject,
  validateCommand: validateCommand,
  measureText: measureText,
  count_performance: count_performance,
  durationToString: durationToString,
  printToTerminal: printToTerminal
}