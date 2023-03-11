"use strict";
const fs = require('node:fs');
const path = require('node:path');

async function fileStructure(data) {
  return console.log("structure");
}

module.exports = {
  event: "file-structure",
  main: fileStructure
}