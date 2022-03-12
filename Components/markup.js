function codeBlock(text, language) {
  if (language) {
    return '```' + language + '\n' + text + "\n" + '```';
  }
  return '```\n' + text + "\n" + '```';
}

module.exports = {
  codeBlock: codeBlock
}