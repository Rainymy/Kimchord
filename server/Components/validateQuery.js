function validQueries(username, userId, videoData, optional_id) {
  if (optional_id) {
    if (!username || !userId || !videoData) {
      return { error: true, comment: "Incorrect Request" };
    }
    return { error: false, comment: null };
  }
  
  if (!videoData) {
    return { error: true, comment: `No metadata with value of ${videoData}` };
  }
  
  let songId = videoData.id;
  
  if (!username || !userId || !songId) {
    return { error: true, comment: "Incorrect Request" };
  }
  
  return { error: false, comment: null };
}

module.exports = { validQueries }