/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    target: 'node',
    externalsPresets: { node: true },
    externals: [
        'utf-8-validate',
        'bufferutil',
        nodeExternals({
        allowlist: [
            /^((?!canvas).)*$/, // canvas contains native binaries
        ],
    })], // in order to ignore all modules in node_modules folder
    entry: './src/node/index.ts',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '../dist/main'),
    },
    module: {
        rules: [
            {
                test: /\.(ts)$/i,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.json',
                        compilerOptions: {
                            sourceMap: true,
                        },
                    },
                },
                'source-map-loader',
                ],
                exclude: [
                    '/node_modules/',
                    '/src/browser',
                ],
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
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
