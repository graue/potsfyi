module.exports = {
  cache: true,
  entry: './main',
  output: {
    filename: '../static/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?optional[]=runtime',
      },
    ],
  },
};
