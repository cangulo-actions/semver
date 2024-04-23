// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
// @ts-ignore
module.exports = async ({ core, exec, config }) => {
  const preCommitConfig = config['pre-commit']

  const commands = preCommitConfig.commands
  if (commands.length > 0) {
    core.startGroup('Running pre-commit commands. Click here for details:')
    for (const command of commands) {
      core.info(`Command: '${command}'`)
      await exec.exec(command)
    }
    core.endGroup()
  }

  const plugins = preCommitConfig.plugins
  if (plugins.length > 0) {
    core.startGroup('Running pre-commit plugins. Click here for details:')
    for (const plugin of plugins) {
      core.info(`Plugin: ${JSON.stringify(plugin, null, 2)}`)
      const pluginFunc = require(`../plugins/${plugin.file}`)
      pluginFunc({ core, exec, config })
    }
    core.endGroup()
  }
}
