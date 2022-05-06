const util = require('../Components/util.js').init();

async function parseSearchString (req, res, GLOBAL_OBJECTS) {
  const { username, userId, inputQuery } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, inputQuery, true);
  console.log({ error, comment }, "parseSearchString");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = await GLOBAL_OBJECTS.youtube.getYoutubeData(inputQuery);
  
  return res.send(video);
}

module.exports = parseSearchString;