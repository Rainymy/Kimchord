const fs = require('fs');
const path = require('path');

function skippableFile(fileName) {
  if (fileName.startsWith(".")) { return true; }
  if (fileName === "package-lock.json") { return true; }
  if (fileName === "node_modules") { return true; }
  
  return false;
}

function getAllFilesInList(folderPath, folderName="./") {
  let fileList = [];
  
  for (let item of fs.readdirSync(folderPath)) {
    if (skippableFile(item)) { continue; }
    
    if (fs.statSync(path.join(folderPath, item)).isDirectory()) {
      const readFolder = getAllFilesInList(
        path.join(folderPath, item), path.join(folderName, item)
      );
      
      fileList.push(...readFolder);
      continue;
    }
    
    fileList.push(path.join(folderName, item));
  }
  
  return fileList;
}

function makeReadStream(filePath) {
  return new Promise(function(resolve, reject) {
    let data = "";
    const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
    
    stream.on("data", (chunk) => { return data += chunk; });
    stream.on("close", () => { resolve(data); });
    stream.on("error", (err) => {
      reject(err);
      return console.log(err);
    });
    
    return stream;
  });
}

function makeWriteStream(filePath, data) {
  return new Promise(function(resolve, reject) {
    return resolve({ error: false, comment: null });
    const stream = fs.createWriteStream(filePath, { flags: "w+" });
    stream.on("ready", () => {
      stream.write(JSON.stringify(data, null, 4));
      stream.end();
    });
    
    stream.on("finish", () => resolve({ error: false, comment: null }));
    stream.on("error", (error) => resolve({ error: true, comment: error }));
  });
}

async function compareFiles(file_1_path, file_2_path) {
  const file_1 = await makeReadStream(file_1_path);
  const file_2 = await makeReadStream(file_2_path);
  
  return {
    new: { path: file_1_path, data: file_1 },
    old: { path: file_2_path, data: file_2 },
    isEqual: file_1 === file_2
  };
}

function isBothStringJSON(file_1, file_2) {
  try {
    const data_1 = JSON.parse(file_1);
    const data_2 = JSON.parse(file_2);
    return true;
  }
  catch (e) { return false; }
}

async function updateProjectFolder(updateFolder, currentFolder) {
  const update_files_list = getAllFilesInList(updateFolder);
  const updated_files = [];
  const failed_files = [];
  
  for (let file of update_files_list) {
    let file_1_path = path.join(updateFolder, file);
    let file_2_path = path.join(currentFolder, file);
    
    let stats = await compareFiles(file_1_path, file_2_path);
    if (stats.isEqual) { continue; }
    
    if (isBothStringJSON(stats.old.data, stats.new.data)) {
      const data_new = JSON.parse(stats.new.data);
      const data_old = JSON.parse(stats.old.data);
      
      stats.new.data = JSON.stringify({ ...data_new, ...data_old });
    }
    
    const write = await makeWriteStream(file_2_path, stats.new.data);
    if (write.error) {
      failed_files.push({ path: file, error: write.error });
      continue;
    }
    updated_files.push(file);
  }
  
  return [ updated_files, failed_files ];
}

function deleteFolder(location) {
  return new Promise((resolve, reject) => {
    fs.rm(location, { recursive: true }, resolve);
  });
}

function existsSync(location) { return fs.existsSync(location); }

module.exports = {
  updateProjectFolder: updateProjectFolder,
  deleteFolder: deleteFolder,
  existsSync: existsSync
}