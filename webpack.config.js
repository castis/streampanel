const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');


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
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
}
