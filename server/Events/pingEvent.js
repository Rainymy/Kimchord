async function pingEvent(req, res, GLOBAL_OBJECTS) {
  return res.send({ time: Date.now() });
}

module.exports = pingEvent;