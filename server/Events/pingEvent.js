async function pingEvent(req, res, GLOBAL_CONSTANTS) {
  return res.send({ time: Date.now() });
}

module.exports = pingEvent;