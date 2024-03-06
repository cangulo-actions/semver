// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
// @ts-ignore
module.exports = async ({ core, exec, config }) => {
  core.startGroup('Running pre-commit scripts. Click here for details:')

  const commands = config.precommitcommands.commands
  for (const command of commands) {
    core.info(`Running: '${command}'`)
    await exec.exec(command)
  }

  core.endGroup()
}
