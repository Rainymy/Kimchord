function appendSong(listObj, file) {
  const create = {
    name: file.name, 
    file: `${file.name}.${file.container}`,
    container: file.container
  }
  
  if (Array.isArray(listObj[file.name])) {
    listObj[file.name].push(create);
    return listObj;
  }
  
  listObj[file.name] = [ create ];
  return listObj;
}

function removeSong(listObj, file) {
  if (Array.isArray(listObj[file.name])) { listObj[file.name].shift(); }
  if (!listObj[file.name].length) { listObj[file.name] = null; }
  
  return listObj;
}

module.exports = {
  appendSong: appendSong,
  removeSong: removeSong
}