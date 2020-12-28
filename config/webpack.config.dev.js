const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    })
  ],
  devServer: { 
    port: 8081,
    contentBase: baseWebpackConfig.externals.path.dist,
    overlay: {
      warnings: true,
      errors: true
    }
  }
})

module.exports = new Promise((resolve, reject) => {
  resolve(devWebpackConfig)
});

