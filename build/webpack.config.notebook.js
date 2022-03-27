// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';
const stylesHandler = 'style-loader';

const staticSrcPath = path.resolve(__dirname, '../src/browser/notebook/static');
const staticDestPath = path.resolve(__dirname, '../dist/notebook');

const config = {
    entry: './src/browser/notebook/index.ts',
    output: {
        path: path.resolve(__dirname, '../dist/notebook'),
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, "../tsconfig.webpack.json"),
                    }
                }],
                include: [
                    path.resolve(__dirname, "../src/browser/notebook"),
                    path.resolve(__dirname, "../src/browser/server")
                ],
                exclude: [
                    path.resolve(__dirname, '../node_modules/'),
                    path.resolve(__dirname, '../src/node'),
                ],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // devtool: 'inline-source-map',
    optimization: {
        minimize: false
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    context: `${staticSrcPath}`,
                    from: `**/*`,
                    to: `${staticDestPath}`
                },
            ],
        }),
    ],
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
