function parseLastCommit(commitMsg) {

    const cleanCommitMsg = commitMsg.trim()
    const commitHasMultipleParts = cleanCommitMsg.includes('\n\n')
    const result = {
        title: cleanCommitMsg,
        entries: [cleanCommitMsg]
    }

    if (commitHasMultipleParts) {
        const commitParts = cleanCommitMsg
            .split('\n\n')
            .map(x => x.trim())

        result.title = commitParts[0]
        const body = commitParts[1]
        result.entries = body
            .split('\r\n')
            .map(x => x.replace('* ', '').trim())
            .filter(x => x !== '')
    }

    return result
}

module.exports = {
    parseLastCommit
}