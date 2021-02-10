const path = require('path');

module.exports = {
  cache: true,
  mode: 'development',
  entry: './main',
  stats: {
    colors: true,
  },
  output: {
    path: path.resolve(__dirname, '../static'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-react',
            '@babel/preset-flow',
            '@babel/preset-env',
          ],
          plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-class-properties',
          ],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
