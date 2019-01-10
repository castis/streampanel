const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const webpack = require('webpack');


module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: ['./src/js/index.js', './src/scss/index.scss'],

    output: {
        path: path.resolve(__dirname),
        filename: 'public/js/index.js',
        publicPath: '/'
    },

    module: {
        rules: [{
            test: /\.jsx?$/,
            include: path.resolve(__dirname, 'src/js'),
            loader: 'babel-loader',
        }, {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader'
            ]
        }]
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            path.join(__dirname, 'node_modules')
        ],
        extensions: ['.js', '.jsx'],
    },

    plugins: [
        new MiniCssExtractPlugin({
            // options similar to the same options in webpackoptions.output
            // both options are optional
            filename: 'public/css/index.css',
            // chunkFilename: '[id].css',
        })
    ],

    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000
    },

    devtool: 'source-map',

    optimization: {
        minimizer: [
            // we specify a custom UglifyJsPlugin here to get source maps in production
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                }
            }),
            new OptimizeCSSAssetsPlugin()
        ]
    },
}
