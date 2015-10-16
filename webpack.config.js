
module.exports = {
  entry: './public/javascripts/app.jsx',
  output: {
    path: __dirname + '/public/dist',
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  externals: {
    'react': 'React',
    'paper': 'paper',
    '$': '$'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.jsx$/, loader: 'jsx-loader?insertPragma=React.DOM&harmony' },
      { test: /\.png$/, loader: 'url-loader?limit=10000&minetype=image/png' },
      { test: /\.jpg$/, loader: 'url-loader?limit=10000&minetype=image/jpg' },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml"
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css']
  }
};