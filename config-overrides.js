module.exports = function override(config, env) {
  // do stuff with the webpack config...
  config.resolve = {
    extensions: ['.tsx', '.ts', '.js'] // This tells Webpack to resolve these extensions automatically.
  }

  return config;
};
