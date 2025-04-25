const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const internalIp = require('internal-ip');
const portfinder = require('portfinder');

module.exports = async () => {
  const ip = await internalIp.v4();
  const defaultPort = 8081;

  const port = await portfinder.getPortPromise({ port: defaultPort });

  console.log('\x1b[36m%s\x1b[0m', `\nFrontend is available at:`);
  console.log('\x1b[32m%s\x1b[0m', `→ http://localhost:${port}`);
  console.log('\x1b[32m%s\x1b[0m', `→ http://${ip}:${port}\n`);

  return {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.svg$/,
          type: 'asset/source',
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/async-race-portfolio/',
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.API_URL': JSON.stringify(process.env.API_URL),
        'process.env.API_PORT': JSON.stringify(process.env.API_PORT)
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
      static: './dist',
      port, 
      hot: true,
      open: true,
    },
  };
};
