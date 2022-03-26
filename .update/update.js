const { execSync } = require('child_process');
const path = require('path');

const { updateProjectFolder, deleteFolder, existsSync } = require('./handleFile.js');
const { colour } = require('./chalk.js');
const { GITHUB_REPO_URL } = require('../config.json');

async function main() {
  console.log("-------------------------------------------------------------");
  const UPDATE_FOLDER = path.join(__dirname, "./NEW_UPDATE");
  const ROOT_FOLDER = path.join(__dirname, "../");
  
  if (!existsSync(UPDATE_FOLDER)) {
    execSync(`git clone ${GITHUB_REPO_URL} ${UPDATE_FOLDER}`); 
    console.log(colour("Downloaded latest version.", "cyan"));
  }
  
  const [ updated, errors ] = await updateProjectFolder(UPDATE_FOLDER, ROOT_FOLDER);
  console.log("┣", colour("Updated: ", "green"), updated);
  console.log("┗", colour(`Errors: `, "yellow"), errors);
  
  const error = await deleteFolder(UPDATE_FOLDER);
  if (error) { console.log(`Error while deleting ${error}.`); }
  else { console.log(colour(`${UPDATE_FOLDER} is deleted!`, "cyan")); }
  console.log("-------------------------------------------------------------");
}

main();