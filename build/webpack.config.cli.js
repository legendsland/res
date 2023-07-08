// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/node/index.ts',
    target: 'node',
    externals: [nodeExternals()],
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, '../dist/cli'),
    },
    module: {
        rules: [
            {
                test: /\.(ts)$/i,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.json",
                        compilerOptions: {
                            'sourceMap': true,
                        },
                    }},
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
    ],
    watchOptions: {
        ignored: './src/common/db.json',
    }
};
