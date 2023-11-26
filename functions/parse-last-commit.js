function parseLastCommit (commitMsg) {
  const cleanCommitMsg = commitMsg.trim()
  const commitHasMultipleParts = cleanCommitMsg.includes('\n\n')

  const result = {
    title: cleanCommitMsg,
    entries: [cleanCommitMsg]
  }

  if (commitHasMultipleParts) {
    const commitParts = cleanCommitMsg
      .split('\n\n')
      .filter(x => x !== '')
      .map(x => x.trim())

    result.title = commitParts[0]
    const body = commitParts.slice(1).join('\r\n')
    const entries = body
      .split('\r\n')
      .filter(x => x !== '')
      .map(x => x.replace('* ', '').trim())
      .filter(x => !x.startsWith('Co-authored-by:'))

    if (entries.length === 0) {
      entries.push(result.title)
    }
    result.entries = entries
  }

  return result
}

module.exports = {
  parseLastCommit
}
