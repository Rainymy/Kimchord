const util = require('../Components/util.js').init();

async function remove(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "remove");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = videoData[0];
  
  const result = await GLOBAL_OBJECTS.fileManager.delete(video);
  if (result.error) {
    return res.send({ error: true, comment: result.comment });
  }
  
  return res.send({ error: false, comment: `Deleted: ${video.title}` });
}

module.exports = remove;