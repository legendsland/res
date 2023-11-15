/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const stylesHandler = 'style-loader';

const staticSrcPath = path.resolve(__dirname, '../src/browser/res/static');
const staticDestPath = path.resolve(__dirname, '../dist/res');

const config = {
    entry: './src/browser/res/index.tsx',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '../dist/res'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.browser.json',
                        compilerOptions: {
                            sourceMap: true,
                        },
                    },
                },
                'source-map-loader',
                ],
                exclude: [
                    '/node_modules/',
                    '/src/node',
                ],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, 'css-loader'],
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
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    context: `${staticSrcPath}`,
                    from: '**/*',
                    to: `${staticDestPath}`,
                },
            ],
        }),
    ],
    watchOptions: {
        ignored: './src/common/db.json',
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
