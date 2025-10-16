const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2'
    }
  },
  externals: {
    // Exclude Node.js modules from the bundle
    'crypto': 'commonjs crypto',
    'fs': 'commonjs fs',
    'path': 'commonjs path',
    'http': 'commonjs http',
    'https': 'commonjs https',
    'net': 'commonjs net',
    'tls': 'commonjs tls',
    'stream': 'commonjs stream',
    'events': 'commonjs events',
    'url': 'commonjs url',
    'util': 'commonjs util',
    'ws': 'commonjs ws'
  }
};
