function validQueries(username, userId, videoData, optional_id) {
  if (optional_id) {
    if (!username || !userId || !videoData) {
      return { error: true, comment: "Incorrect Request" };
    }
    return { error: false, comment: null };
  }
  
  if (!videoData) {
    return { error: true, comment: `Missing metadata: ${videoData}` };
  }
  
  if (videoData.type === "playlist") {
    return { error: false, comment: null };
  }
  
  let haveSongId = videoData.id ?? videoData.every((current) => {
    return typeof current.id === "string";
  });
  
  if (!username || !userId || !haveSongId) {
    return { error: true, comment: "Incorrect Request" };
  }
  
  return { error: false, comment: null };
}

module.exports = { validQueries }