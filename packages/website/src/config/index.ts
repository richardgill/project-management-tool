import _ from 'lodash'
import productionConfig from './prod'
import developmentConfig from './dev'
import defaults from './defaults'

const environment = process.env.REACT_APP_CONFIG_ENV

const getEnvironment = () => {
  switch (environment) {
    case 'production':
      return productionConfig
    case 'development':
      return developmentConfig
    default:
      return developmentConfig
  }
}

const config = _.merge({}, defaults, getEnvironment())

console.log(`config: ${JSON.stringify(config)}`)

export default config as any
