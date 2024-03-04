const yml = require('js-yaml')
const Ajv = require('ajv')
const fs = require('fs')

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = ({ core, inputConfig }) => {
  core.startGroup('getting configuration')

  const schemaPath = `${process.env.GITHUB_ACTION_PATH}/config.schema.yml`
  const schemaContent = fs.readFileSync(schemaPath)
  const schema = yml.load(schemaContent)
  let config = {}

  if (inputConfig !== '') {
    const configPath = inputConfig
    const configContent = fs.readFileSync(configPath)
    config = yml.load(configContent)
  }

  const ajv = new Ajv({ useDefaults: true }) // add default values to the config properties
  const validate = ajv.compile(schema)
  const valid = validate(config)

  if (!valid) {
    const errorsJson = JSON.stringify(validate.errors, null, 2)
    core.setFailed(`configuration file is not valid: ${errorsJson}`)
  }

  console.log('config:', JSON.stringify(config, null, 2))
  core.setOutput('config', config)

  core.endGroup()
}
