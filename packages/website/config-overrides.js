const path = require('path')

module.exports = {
  webpack: (config, env) => {
    // See this guide: https://github.com/facebook/create-react-app/issues/5118#issuecomment-464025389
    config.resolve = {
      ...config.resolve,
      alias: { '@': path.resolve(__dirname, 'src') },
    };
    return config
  },
}
