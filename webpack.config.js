const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: ['./src/js/index.js', './src/scss/index.scss'],

    output: {
        path: path.resolve(__dirname),
        filename: 'static/js/index.js',
        publicPath: '/',
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, 'src/js'),
                loader: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
        ],
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            path.join(__dirname, 'node_modules'),
        ],
        extensions: ['.js', '.jsx'],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/index.css',
        }),
    ],

    devtool: 'source-map',

    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
            }),
            new OptimizeCSSAssetsPlugin(),
        ],
    },
}
