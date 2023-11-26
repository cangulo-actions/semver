function parseLastCommit(commitMsg) {
    const cleanCommitMsg = commitMsg.trim()
    const commitHasMultipleParts = cleanCommitMsg.includes('\n\n')

    console.log('cleanCommitMsg', cleanCommitMsg)
    console.log('commitHasMultipleParts', commitHasMultipleParts)

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

        console.log('body', body)

        result.entries = body
            .split('\r\n')
            .filter(x => x !== '')
            .map(x => {
                console.log('entry before filter:', x)
                return x
            })
            .map(x => x.replace('* ', '').trim())
    }

    console.log('parseLastCommit', JSON.stringify(result))

    return result
}

module.exports = {
    parseLastCommit
}